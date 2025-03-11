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
			const ipFingerprintResult = await client.query(ipFingerprintQuery, [
				uuid,
			]);

			if (ipFingerprintResult.rows.length === 0) {
				return reply
					.status(404)
					.send({ error: 'No authentication logs found' });
			}

			// Extract unique IPs and fingerprints
			const ips = ipFingerprintResult.rows.map((row) => row.ip_address);
			const fingerprints = ipFingerprintResult.rows.map(
				(row) => row.fingerprint
			);

			// 🔹 Step 2: Fetch all matching logs
			const authLogsQuery = `
            SELECT * FROM auth_logs
            WHERE 
                user_id = $1 
                OR (user_id IS NULL OR user_id = $1)
                AND (ip_address = ANY($2) OR fingerprint = ANY($3))
            ORDER BY created_at DESC
        `;
			const authLogsResult = await client.query(authLogsQuery, [
				uuid,
				ips,
				fingerprints,
			]);

			return reply.send(authLogsResult.rows);
		} catch (error) {
			console.error('Error fetching authentication logs:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to fetch authentication logs' });
		} finally {
			client.release();
		}
	});

	fastify.post('/assignScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.body;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			// Optionally, check if this relationship already exists to avoid duplicates.
			const checkQuery = `
      SELECT * FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
    `;
			const checkResult = await fastify.pg.query(checkQuery, [
				user_id,
				group_id,
			]);
			if (checkResult.rows.length > 0) {
				return reply
					.status(409)
					.send({ error: 'Schedule group already assigned to the user' });
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
			return reply
				.status(500)
				.send({ error: 'Failed to assign schedule group' });
		}
	});	

	fastify.delete('/removeScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.query;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			const query = `
      DELETE FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			if (rows.length === 0) {
				return reply
					.status(404)
					.send({ error: 'Schedule group assignment not found' });
			}
			return reply.send({ message: 'Schedule group removed successfully' });
		} catch (error) {
			console.error('Error removing schedule group:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to remove schedule group' });
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
				return reply
					.status(400)
					.send({ error: 'User ID and role are required' });
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
}

module.exports = routes;
