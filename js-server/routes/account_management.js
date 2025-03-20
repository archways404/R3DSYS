async function routes(fastify, options) {
	// Fastify endpoint to get accounts
	fastify.get('/get-accounts', async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			// Query parameter (optional for filtering by type)
			const { type } = request.query;

			// Fetch users based on the query
			const users = await getUsers(client, type);

			// Send the response
			return reply.send(users);
		} catch (error) {
			console.error('Error fetching users:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch users' });
		} finally {
			client.release();
		}
	});

	fastify.get('/get-user', async (request, reply) => {
		const { uuid } = request.query;
		if (!uuid) {
			return reply.status(400).send({ error: 'UUID is required' });
		}
		const client = await fastify.pg.connect();
		try {
			// Fetch user details
			const userDetails = await getUserDetails(client, uuid);
			if (!userDetails) {
				return reply.status(404).send({ error: 'User not found' });
			}
			// Fetch account lockout details
			const lockoutDetails = await getAccountLockout(client, uuid);
			// Fetch schedule groups
			const scheduleGroups = await getScheduleGroups(client, uuid);
			// Combine and send the response
			const response = {
				userDetails,
				lockoutDetails,
				scheduleGroups,
			};
			return reply.send(response);
		} catch (error) {
			console.error('Error fetching user:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch user' });
		} finally {
			client.release();
		}
	});

	fastify.get('/get-auth-logs', async (request, reply) => {
		const { uuid } = request.query;
		if (!uuid) {
			return reply.status(400).send({ error: 'UUID is required' });
		}

		const client = await fastify.pg.connect();
		try {
			// 🔹 Step 1: Get IPs and Fingerprints associated with the user
			const ipFingerprintQuery = `
            SELECT DISTINCT ip_address, fingerprint 
            FROM auth_logs 
            WHERE user_id = $1
        `;
			const ipFingerprintResult = await client.query(ipFingerprintQuery, [uuid]);

			if (ipFingerprintResult.rows.length === 0) {
				return reply.status(404).send({ error: 'No authentication logs found' });
			}

			// Extract unique IPs and fingerprints
			const ips = ipFingerprintResult.rows.map((row) => row.ip_address);
			const fingerprints = ipFingerprintResult.rows.map((row) => row.fingerprint);

			// 🔹 Step 2: Fetch all matching logs
			const authLogsQuery = `
            SELECT * FROM auth_logs
            WHERE 
                user_id = $1 
                OR (user_id IS NULL OR user_id = $1)
                AND (ip_address = ANY($2) OR fingerprint = ANY($3))
            ORDER BY created_at DESC
        `;
			const authLogsResult = await client.query(authLogsQuery, [uuid, ips, fingerprints]);

			return reply.send(authLogsResult.rows);
		} catch (error) {
			console.error('Error fetching authentication logs:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch authentication logs' });
		} finally {
			client.release();
		}
	});

	fastify.post('/assignScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.body;
			if (!user_id || !group_id) {
				return reply.status(400).send({ error: 'user_id and group_id are required' });
			}

			// Optionally, check if this relationship already exists to avoid duplicates.
			const checkQuery = `
      SELECT * FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
    `;
			const checkResult = await fastify.pg.query(checkQuery, [user_id, group_id]);
			if (checkResult.rows.length > 0) {
				return reply.status(409).send({ error: 'Schedule group already assigned to the user' });
			}

			const query = `
      INSERT INTO account_schedule_groups (user_id, group_id)
      VALUES ($1, $2)
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			return reply.status(201).send(rows[0]);
		} catch (error) {
			console.error('Error assigning schedule group:', error.message);
			return reply.status(500).send({ error: 'Failed to assign schedule group' });
		}
	});

	fastify.delete('/removeScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.query;
			if (!user_id || !group_id) {
				return reply.status(400).send({ error: 'user_id and group_id are required' });
			}

			const query = `
      DELETE FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Schedule group assignment not found' });
			}
			return reply.send({ message: 'Schedule group removed successfully' });
		} catch (error) {
			console.error('Error removing schedule group:', error.message);
			return reply.status(500).send({ error: 'Failed to remove schedule group' });
		}
	});

	fastify.post('/unlockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = false,
          failed_attempts = 0,
          unlock_time = NULL
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error unlocking account:', error.message);
			return reply.status(500).send({ error: 'Failed to unlock account' });
		}
	});

	fastify.post('/lockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = true,
          unlock_time = NOW() + interval '1000 years'
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error locking account:', error.message);
			return reply.status(500).send({ error: 'Failed to lock account' });
		}
	});

	fastify.post('/updateUserRole', async (request, reply) => {
		try {
			const { user_id, role } = request.body;
			if (!user_id || !role) {
				return reply.status(400).send({ error: 'User ID and role are required' });
			}

			// Validate that the role is one of the allowed options.
			const allowedRoles = ['admin', 'worker', 'maintainer'];
			if (!allowedRoles.includes(role)) {
				return reply.status(400).send({ error: 'Invalid role provided' });
			}

			const query = `
      UPDATE account
      SET role = $2
      WHERE user_id = $1
      RETURNING user_id, role
    `;
			const { rows } = await fastify.pg.query(query, [user_id, role]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error updating user role:', error.message);
			return reply.status(500).send({ error: 'Failed to update user role' });
		}
	});

	// WORKER - Update account information in settings
	/*
	fastify.post('/updateUserInfo', async (request, reply) => {
		const { user_id, first_name, last_name, email, notification_email, teams_email } = request.body;

		if (!user_id) {
			return reply.status(400).send({ error: 'User ID is required' });
		}

		const client = await fastify.pg.connect();
		try {
			// ✅ Update the user's info in the database
			await client.query(
				`UPDATE account 
             SET first_name = $2, last_name = $3, email = $4, 
                 notification_email = $5, teams_email = $6 
             WHERE user_id = $1`,
				[user_id, first_name, last_name, email, notification_email, teams_email]
			);

			// ✅ Delete Redis cache for this user (so fresh data will be fetched later)
			const userInfoCacheKey = `${user_id}:userinfo`;
			await fastify.redis.del(userInfoCacheKey);

			// ✅ Send success response
			return reply.send({
				message: 'User information updated successfully. Cache reset.',
			});
		} catch (err) {
			console.error('Error updating user info:', err);
			return reply.status(500).send({ error: 'Failed to update user information' });
		} finally {
			client.release();
		}
	});
	*/

	// WORKER - Update account information in settings
	fastify.post('/updateUserInfo', async (request, reply) => {
		const { user_id, first_name, last_name, email, notification_email, teams_email } = request.body;

		// ✅ Validate that user_id is present
		if (!user_id) {
			return reply.status(400).send({ error: 'User ID is required' });
		}

		// ✅ Utility function to clean and validate inputs
		const cleanAndValidate = (name, value, regex = null, toLower = false) => {
			if (!value || typeof value !== 'string') {
				return { error: `${name.replace('_', ' ')} is required and must be a string.` };
			}

			const trimmedValue = value.trim();
			if (trimmedValue.length === 0) {
				return { error: `${name.replace('_', ' ')} cannot be empty.` };
			}

			if (regex && !regex.test(trimmedValue)) {
				return { error: `${name.replace('_', ' ')} contains invalid characters.` };
			}

			return toLower ? trimmedValue.toLowerCase() : trimmedValue;
		};

		// ✅ Validate First and Last Name (only letters `a-z åäö`)
		const first = cleanAndValidate('first_name', first_name, /^[a-zA-ZåäöÅÄÖ]+$/);
		const last = cleanAndValidate('last_name', last_name, /^[a-zA-ZåäöÅÄÖ]+$/);
		if (first.error) return reply.status(400).send({ error: first.error });
		if (last.error) return reply.status(400).send({ error: last.error });

		// ✅ Validate Emails (ensure proper format, convert to lowercase)
		const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
		const cleanEmail = cleanAndValidate('email', email, emailRegex, true);
		const cleanNotificationEmail = cleanAndValidate(
			'notification_email',
			notification_email,
			emailRegex,
			true
		);
		const cleanTeamsEmail = cleanAndValidate('teams_email', teams_email, emailRegex, true);

		if (cleanEmail.error) return reply.status(400).send({ error: cleanEmail.error });
		if (cleanNotificationEmail.error)
			return reply.status(400).send({ error: cleanNotificationEmail.error });
		if (cleanTeamsEmail.error) return reply.status(400).send({ error: cleanTeamsEmail.error });

		const client = await fastify.pg.connect();
		try {
			// ✅ Update user information in the database
			await client.query(
				`UPDATE account 
             SET first_name = $2, last_name = $3, email = $4, 
                 notification_email = $5, teams_email = $6 
             WHERE user_id = $1`,
				[user_id, first, last, cleanEmail, cleanNotificationEmail, cleanTeamsEmail]
			);

			// ✅ Fetch the updated user data
			const userResult = await client.query(
				`SELECT user_id, first_name, last_name, email, notification_email, teams_email, role 
             FROM account WHERE user_id = $1`,
				[user_id]
			);

			if (userResult.rows.length === 0) {
				return reply.status(404).send({ error: 'User not found' });
			}

			const updatedUser = userResult.rows[0];

			// ✅ Fetch user groups
			const userGroups = await getUserGroups(client, updatedUser.user_id);

			// ✅ Format the user object correctly
			const userData = {
				uuid: updatedUser.user_id,
				email: updatedUser.email,
				role: updatedUser.role,
				first: updatedUser.first_name,
				last: updatedUser.last_name,
				notification_email: updatedUser.notification_email,
				teams_email: updatedUser.teams_email,
				groups: userGroups,
			};

			// Delete Redis cache for this user (forcing a refresh on next fetch)
			const userInfoCacheKey = `${user_id}:userinfo`;
			await fastify.redis.del(userInfoCacheKey);

			// Generate a new JWT token with the correctly formatted user data
			const newAuthToken = fastify.jwt.sign(userData, { expiresIn: '45m' });

			// Set the new `authToken` cookie
			reply.setCookie('authToken', newAuthToken, {
				httpOnly: true,
				sameSite: 'None',
				secure: true,
				path: '/',
			});

			// Store the fresh user data in Redis
			await fastify.redis.setex(userInfoCacheKey, 900, JSON.stringify(userData)); // 15 min TTL

			// Send success response with updated user info
			return reply.send({
				message: 'User information updated successfully. Cache reset.',
				user: userData,
			});
		} catch (err) {
			console.error('Error updating user info:', err);
			return reply.status(500).send({ error: 'Failed to update user information' });
		} finally {
			client.release();
		}
	});

	// Helper function to fetch users
	async function getUsers(client, type) {
		// Base query
		let query = `
        SELECT user_id, email, first_name, last_name, role 
        FROM account
    `;

		// Add a WHERE clause if 'type' is provided
		const values = [];
		if (type) {
			query += ` WHERE role = $1`;
			values.push(type);
		}

		// Execute the query
		const result = await client.query(query, values);

		// Return the rows
		return result.rows;
	}

	// Helper function to get user details (excluding sensitive fields)
	async function getUserDetails(client, uuid) {
		const query = `
        SELECT user_id, email, first_name, last_name, notification_email, role
        FROM account
        WHERE user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows[0];
	}

	// Helper function to get account lockout details
	async function getAccountLockout(client, uuid) {
		const query = `
        SELECT *
        FROM account_lockout
        WHERE user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows[0]; // Assuming one lockout record per user
	}

	// Helper function to get schedule groups for the user
	async function getScheduleGroups(client, uuid) {
		const query = `
        SELECT sg.group_id, sg.name
        FROM schedule_groups sg
        INNER JOIN account_schedule_groups asg ON sg.group_id = asg.group_id
        WHERE asg.user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows; // Return all associated schedule groups
	}

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
}

module.exports = routes;
