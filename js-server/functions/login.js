const argon2 = require('argon2');
const { createLog } = require('./log.js');

async function getUserGroups(client, userId) {
	try {
		const { rows: groups } = await client.query(
			`SELECT sg.group_id, sg.name 
			 FROM account_schedule_groups AS asg
			 JOIN schedule_groups AS sg ON asg.group_id = sg.group_id
			 WHERE asg.user_id = $1`,
			[userId]
		);

		return groups.map((group) => ({
			id: group.group_id,
			name: group.name,
		}));
	} catch (err) {
		console.error('Error fetching user groups:', err);
		throw new Error('Database query failed');
	}
}

async function login(fastify, client, email, password, ip, deviceId) {
	try {
		const loginCacheKey = `${email}:logindetails`;

		// 🔹 Step 1: Check Redis for cached login details
		let loginDetails = await fastify.redis.get(loginCacheKey);
		let user;

		if (loginDetails) {
			loginDetails = JSON.parse(loginDetails);
			user = {
				user_id: loginDetails.uuid,
				password: loginDetails.password,
			};
		} else {
			// ❌ Cache Miss - Fetch from PostgreSQL in **ONE QUERY**
			const userResult = await client.query(
				`SELECT 
        a.user_id, a.password, a.first_name, a.last_name, a.role,
        a.notification_email, a.teams_email, 
        al.failed_attempts, al.locked, al.unlock_time
     FROM account a
     LEFT JOIN account_lockout al ON a.user_id = al.user_id
     WHERE a.email = $1`,
				[email]
			);

			if (userResult.rows.length === 0) {
				// 🔹 Log failed login attempt
				createLog({
					type: 'auth',
					user_id: null,
					ip_address: ip,
					fingerprint: deviceId,
					success: false,
					error_message: 'Email does not exist',
				});

				return { error: 'Invalid email or password', status: 400 };
			}

			user = userResult.rows[0];

			if (!user.user_id) {
				console.error('❌ Error: user_id is undefined!');
				return { error: 'Invalid user ID', status: 400 };
			}

			// 🔹 Check if an entry exists in `account_lockout`, if not, create one
			const lockoutCheck = await client.query(`SELECT 1 FROM account_lockout WHERE user_id = $1`, [
				user.user_id,
			]);

			if (lockoutCheck.rowCount === 0) {
				await client.query(
					`INSERT INTO account_lockout (user_id, failed_attempts, last_failed_ip, locked, unlock_time)
         VALUES ($1, 0, NULL, FALSE, NULL)`,
					[user.user_id]
				);
			}

			// Ensure cache for login details
			await fastify.redis.setex(
				loginCacheKey,
				900,
				JSON.stringify({
					uuid: user.user_id,
					password: user.password,
				})
			);
		}

		// 🔹 Step 2: Check if account is locked
		if (user.locked && user.unlock_time && user.unlock_time > new Date()) {
			// 🔹 Log failed login attempt
			createLog({
				type: 'auth',
				user_id: user.user_id,
				ip_address: ip,
				fingerprint: deviceId,
				success: false,
				error_message: 'Account is locked',
			});

			return {
				error: `Account is locked until ${user.unlock_time.toISOString()}`,
				status: 403,
				unlock_time: user.unlock_time.toISOString(),
			};
		}

		// If lockout expired, reset it
		if (user.locked) {
			await client.query(
				`UPDATE account_lockout 
                 SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
                 WHERE user_id = $1`,
				[user.user_id]
			);
		}

		// 🔹 Step 3: Verify Password
		const isPasswordValid = await argon2.verify(user.password, password);
		if (!isPasswordValid) {
			// 🚨 Failed Login - Update Lockout Table
			await fastify.redis.del(loginCacheKey);
			const failedAttempts = Number(user.failed_attempts || 0) + 1;

			// Lock account after 5 failed attempts
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
				await client.query(
					`UPDATE account_lockout 
                     SET failed_attempts = $2, locked = TRUE, unlock_time = $3, last_failed_ip = $4, last_failed_time = CURRENT_TIMESTAMP 
                     WHERE user_id = $1`,
					[user.user_id, failedAttempts, unlockTime, ip]
				);

				// 🔹 Log failed login attempt
				createLog({
					type: 'auth',
					user_id: user.user_id,
					ip_address: ip,
					fingerprint: deviceId,
					success: false,
					error_message: 'Account locked due to too many failed attempts',
				});

				return {
					error: `Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`,
					status: 403,
					unlock_time: unlockTime.toISOString(),
				};
			}

			// Increment failed attempts without locking
			await client.query(
				`UPDATE account_lockout 
                 SET failed_attempts = $2, last_failed_ip = $3, last_failed_time = CURRENT_TIMESTAMP 
                 WHERE user_id = $1`,
				[user.user_id, failedAttempts, ip]
			);

			// 🔹 Log failed login attempt
			createLog({
				type: 'auth',
				user_id: user.user_id,
				ip_address: ip,
				fingerprint: deviceId,
				success: false,
				error_message: 'Invalid password',
			});

			return { error: 'Invalid email or password', status: 401 };
		}

		// 🔹 Step 4: Reset lockout on successful login
		await client.query(
			`UPDATE account_lockout 
             SET failed_attempts = 0, locked = FALSE, unlock_time = NULL 
             WHERE user_id = $1`,
			[user.user_id]
		);

		// 🔹 Step 5: Fetch user groups (Only if cache miss)
		const userInfoCacheKey = `${user.user_id}:userinfo`;
		let userInfo = await fastify.redis.get(userInfoCacheKey);

		if (!userInfo) {
			const userGroups = await getUserGroups(client, user.user_id);
			userInfo = {
				uuid: user.user_id,
				email,
				first: user.first_name,
				last: user.last_name,
				role: user.role,
				notification_email: user.notification_email, // Add this
				teams_email: user.teams_email, // Add this
				groups: userGroups,
			};

			// Cache user profile
			await fastify.redis.setex(userInfoCacheKey, 900, JSON.stringify(userInfo));
		} else {
			userInfo = JSON.parse(userInfo);
		}

		// 🔹 Log successful login attempt
		createLog({
			type: 'auth',
			user_id: user.user_id,
			ip_address: ip,
			fingerprint: deviceId,
			success: true,
			error_message: null,
		});

		return { user: userInfo, status: 200 };
	} catch (error) {
		console.error('Login failed:', error.message);
		return { error: 'Internal Server Error', status: 500 };
	}
}

module.exports = { login, getUserGroups };