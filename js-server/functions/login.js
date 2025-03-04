const argon2 = require('argon2');

/*
async function login(client, email, password, ip, deviceid) {
	try {
		const userResult = await client.query(
			'SELECT user_id, password, first_name, last_name, role FROM account WHERE email = $1',
			[email]
		);

		if (userResult.rows.length === 0) {
			throw new Error('Account with email does not exist');
		}

		const user = userResult.rows[0];
		const storedHash = user.password;

		// Ensure the account lockout entry exists
		await client.query(
			`INSERT INTO account_lockout (user_id, failed_attempts, locked, unlock_time)
			 VALUES ($1, 0, FALSE, NULL)
			 ON CONFLICT (user_id) DO NOTHING`,
			[user.user_id]
		);

		// Check for lockout status
		const lockoutResult = await client.query(
			`SELECT locked, unlock_time FROM account_lockout WHERE user_id = $1`,
			[user.user_id]
		);

		const lockout = lockoutResult.rows[0];
		if (lockout && lockout.locked) {
			const unlockTime = lockout.unlock_time;
			if (unlockTime && unlockTime > new Date()) {
				throw new Error(`Account is locked until ${unlockTime.toISOString()}`);
			}

			// Reset lockout if time has passed
			await client.query(
				`UPDATE account_lockout 
				 SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
				 WHERE user_id = $1`,
				[user.user_id]
			);
		}

		// Verify the password
		const isPasswordValid = await argon2.verify(storedHash, password);

		if (!isPasswordValid) {
			// Handle failed login attempt
			await client.query(
				`UPDATE account_lockout 
				 SET failed_attempts = failed_attempts + 1, last_failed_ip = $2, last_failed_time = CURRENT_TIMESTAMP 
				 WHERE user_id = $1`,
				[user.user_id, ip]
			);

			// Check if the account should be locked
			const failedAttemptsResult = await client.query(
				`SELECT failed_attempts FROM account_lockout WHERE user_id = $1`,
				[user.user_id]
			);

			const failedAttempts = failedAttemptsResult.rows[0]?.failed_attempts || 0;
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
				await client.query(
					`UPDATE account_lockout 
					 SET locked = TRUE, unlock_time = $2 
					 WHERE user_id = $1`,
					[user.user_id, unlockTime]
				);
				throw new Error(
					`Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`
				);
			}

			throw new Error('Invalid password');
		}

		// Reset failed attempts on successful login
		await client.query(
			`UPDATE account_lockout 
			 SET failed_attempts = 0, locked = FALSE, unlock_time = NULL 
			 WHERE user_id = $1`,
			[user.user_id]
		);

		// Fetch user groups
		const userGroups = await getUserGroups(client, user.user_id);

		return {
			user_id: user.user_id,
			email,
			first_name: user.first_name,
			last_name: user.last_name,
			role: user.role,
			groups: userGroups, // Include groups in the response
		};
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	} finally {
		client.release();
	}
}
	*/

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

/* MOST RECENT CHANGE
async function login(fastify, client, email, password, ip, deviceId) {
	try {
		const loginCacheKey = `${email}:logindetails`;

		// Step 1: Check Redis for cached login details
		let loginDetails = await fastify.redis.get(loginCacheKey);
		let userId, storedHash;

		if (loginDetails) {
			// ✅ Redis Cache Hit - Use cached login details
			loginDetails = JSON.parse(loginDetails);
			userId = loginDetails.uuid;
			storedHash = loginDetails.password;
		} else {
			// ❌ Cache Miss - Fetch from PostgreSQL
			const userResult = await client.query(
				'SELECT user_id, password FROM account WHERE email = $1',
				[email]
			);

			if (userResult.rows.length === 0) {
				throw new Error('Account with email does not exist');
			}

			const user = userResult.rows[0];
			userId = user.user_id;
			storedHash = user.password;
		}

		// Ensure the account lockout entry exists
		await client.query(
			`INSERT INTO account_lockout (user_id, failed_attempts, locked, unlock_time)
			 VALUES ($1, 0, FALSE, NULL)
			 ON CONFLICT (user_id) DO NOTHING`,
			[userId]
		);

		// Check for lockout status
		const lockoutResult = await client.query(
			`SELECT locked, unlock_time FROM account_lockout WHERE user_id = $1`,
			[userId]
		);

		const lockout = lockoutResult.rows[0];
		if (lockout && lockout.locked) {
			const unlockTime = lockout.unlock_time;
			if (unlockTime && unlockTime > new Date()) {
				throw new Error(`Account is locked until ${unlockTime.toISOString()}`);
			}

			// Reset lockout if time has passed
			await client.query(
				`UPDATE account_lockout 
				 SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
				 WHERE user_id = $1`,
				[userId]
			);
		}

		// Step 2: Verify Password Hash
		const isPasswordValid = await argon2.verify(storedHash, password);
		if (!isPasswordValid) {
			// 🚨 Failed Login - Remove Cache & Update Lockout Table
			await fastify.redis.del(loginCacheKey);

			await client.query(
				`UPDATE account_lockout 
				 SET failed_attempts = failed_attempts + 1, last_failed_ip = $2, last_failed_time = CURRENT_TIMESTAMP 
				 WHERE user_id = $1`,
				[userId, ip]
			);

			// Check if the account should be locked
			const failedAttemptsResult = await client.query(
				`SELECT failed_attempts FROM account_lockout WHERE user_id = $1`,
				[userId]
			);

			const failedAttempts = failedAttemptsResult.rows[0]?.failed_attempts || 0;
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
				await client.query(
					`UPDATE account_lockout 
					 SET locked = TRUE, unlock_time = $2 
					 WHERE user_id = $1`,
					[userId, unlockTime]
				);
				throw new Error(
					`Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`
				);
			}

			throw new Error('Invalid password');
		}

		// Step 3: Reset failed attempts on successful login
		await client.query(
			`UPDATE account_lockout 
			 SET failed_attempts = 0, locked = FALSE, unlock_time = NULL 
			 WHERE user_id = $1`,
			[userId]
		);

		// Step 4: Fetch user groups and profile
		const userGroups = await getUserGroups(client, userId);
		const userProfile = await client.query(
			'SELECT first_name, last_name, role FROM account WHERE user_id = $1',
			[userId]
		);

		if (userProfile.rows.length === 0) {
			throw new Error('User profile not found');
		}

		const firstName = userProfile.rows[0].first_name;
		const lastName = userProfile.rows[0].last_name;
		const role = userProfile.rows[0].role;

		// 🔹 Step 5: Construct full user profile
		const userInfo = {
			uuid: userId,
			email,
			first: firstName,
			last: lastName,
			role,
			groups: userGroups,
		};

		// Step 6: Cache **ONLY LOGIN DATA** in `${email}:logindetails`
		const cacheExists = await fastify.redis.setnx(
			loginCacheKey,
			JSON.stringify({
				uuid: userId,
				email,
				password: storedHash, // **Only password hash!**
			})
		);
		if (cacheExists) {
			await fastify.redis.expire(loginCacheKey, 900); // 900 seconds = 15 minutes
		}

		// Step 7: Cache full user profile for `/protected` route if it doesn't exist
		const userInfoCacheKey = `${userId}:userinfo`;
		const userInfoExists = await fastify.redis.setnx(
			userInfoCacheKey,
			JSON.stringify(userInfo)
		);
		if (userInfoExists) {
			await fastify.redis.expire(userInfoCacheKey, 900);
		}

		// Return user object
		return userInfo;
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	}
}
*/

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
                    al.failed_attempts, al.locked, al.unlock_time
                 FROM account a
                 LEFT JOIN account_lockout al ON a.user_id = al.user_id
                 WHERE a.email = $1`,
				[email]
			);

			if (userResult.rows.length === 0) {
				throw new Error('Account with email does not exist');
			}

			user = userResult.rows[0];

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
		if (user.locked) {
			if (user.unlock_time && user.unlock_time > new Date()) {
				throw new Error(
					`Account is locked until ${user.unlock_time.toISOString()}`
				);
			} else {
				// Unlock account if lockout time has passed
				await client.query(
					`UPDATE account_lockout 
                     SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
                     WHERE user_id = $1`,
					[user.user_id]
				);
			}
		}

		// 🔹 Step 3: Verify Password
		const isPasswordValid = await argon2.verify(user.password, password);
		if (!isPasswordValid) {
			// 🚨 Failed Login - Update Lockout Table
			await fastify.redis.del(loginCacheKey);
			const failedAttempts = user.failed_attempts + 1;

			// Lock account after 5 failed attempts
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
				await client.query(
					`UPDATE account_lockout 
                     SET failed_attempts = $2, locked = TRUE, unlock_time = $3, last_failed_ip = $4, last_failed_time = CURRENT_TIMESTAMP 
                     WHERE user_id = $1`,
					[user.user_id, failedAttempts, unlockTime, ip]
				);

				throw new Error(
					`Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`
				);
			}

			// Increment failed attempts without locking
			await client.query(
				`UPDATE account_lockout 
                 SET failed_attempts = $2, last_failed_ip = $3, last_failed_time = CURRENT_TIMESTAMP 
                 WHERE user_id = $1`,
				[user.user_id, failedAttempts, ip]
			);

			throw new Error('Invalid password');
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
				groups: userGroups,
			};

			// Cache user profile
			await fastify.redis.setex(
				userInfoCacheKey,
				900,
				JSON.stringify(userInfo)
			);
		} else {
			userInfo = JSON.parse(userInfo);
		}

		return userInfo;
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	}
}

module.exports = { login, getUserGroups };

/*
const argon2 = require('argon2');

async function login(client, email, password, ip, deviceid) {
	try {
		// Query for the user's information, including the stored password hash
		const userResult = await client.query(
			'SELECT user_id, password, first_name, last_name, role FROM account WHERE email = $1',
			[email]
		);

		if (userResult.rows.length === 0) {
			throw new Error('Account with email does not exist');
		}

		const user = userResult.rows[0];
		const storedHash = user.password;

		// Ensure an entry exists in the account_lockout table
		await client.query(
			`INSERT INTO account_lockout (user_id, failed_attempts, locked, unlock_time)
				VALUES ($1, 0, FALSE, NULL)
				ON CONFLICT (user_id) DO NOTHING`,
			[user.user_id]
		);

		// Check if the account is locked
		const lockoutResult = await client.query(
			`SELECT locked, unlock_time FROM account_lockout WHERE user_id = $1`,
			[user.user_id]
		);

		const lockout = lockoutResult.rows[0];
		if (lockout && lockout.locked) {
			const unlockTime = lockout.unlock_time;
			if (unlockTime && unlockTime > new Date()) {
				throw new Error(`Account is locked until ${unlockTime.toISOString()}`);
			}

			// If unlock_time has passed, reset the lockout
			await client.query(
				`UPDATE account_lockout 
					SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
					WHERE user_id = $1`,
				[user.user_id]
			);
		}

		// Verify the password using Argon2
		const isPasswordValid = await argon2.verify(storedHash, password);

		if (!isPasswordValid) {
			// Handle failed login attempt (increment failed_attempts, etc.)
			await client.query(
				`UPDATE account_lockout 
					SET failed_attempts = failed_attempts + 1, last_failed_ip = $2, last_failed_time = CURRENT_TIMESTAMP 
					WHERE user_id = $1`,
				[user.user_id, ip]
			);

			// Check for lockout after incrementing failed attempts
			const failedAttemptsResult = await client.query(
				`SELECT failed_attempts FROM account_lockout WHERE user_id = $1`,
				[user.user_id]
			);

			const failedAttempts = failedAttemptsResult.rows[0]?.failed_attempts || 0;
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 1 * 60 * 1000); // 15 minutes from now
				await client.query(
					`UPDATE account_lockout 
						SET locked = TRUE, unlock_time = $2 
						WHERE user_id = $1`,
					[user.user_id, unlockTime]
				);
				throw new Error(
					`Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`
				);
			}

			throw new Error('Invalid password');
		}

		// If successful, reset failed attempts and return user info
		await client.query(
			`UPDATE account_lockout 
				SET failed_attempts = 0, locked = FALSE, unlock_time = NULL 
				WHERE user_id = $1`,
			[user.user_id]
		);

		return {
			user_id: user.user_id,
			email,
			first_name: user.first_name,
			last_name: user.last_name,
			role: user.role,
		};
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { login };
*/
