async function routes(fastify, options) {
	/*
	fastify.get('/active-schedule-table', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			// Extract and verify token
			const authToken = request.cookies.authToken;
			if (!authToken) {
				return reply.status(401).send({ error: 'Unauthorized' });
			}

			// Decode token (assuming it's a JWT)
			const decoded = fastify.jwt.verify(authToken);
			console.log('decoded', decoded);
			if (
				!decoded ||
				!decoded.uuid ||
				!decoded.email ||
				!decoded.role ||
				!decoded.first ||
				!decoded.last ||
				!decoded.groups
			) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			const userRole = decoded.role;
			const userGroups = decoded.groups;

			console.log('User Role:', userRole);
			console.log('User Groups:', userGroups);

			let data = 0;

			if (userRole === 'admin') {
				console.log('SQL for admin');
			} else if (userRole === 'maintainer') {
				console.log('SQL for maintainer');
			} else {
				return reply.status(403).send({ error: 'Access Denied' });
			}

			// Send the response
			return reply.send(data);
		} catch (error) {
			console.error('Error fetching users:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch users' });
		} finally {
			client.release();
		}
	});
  */
	fastify.get('/active-schedule-table', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			// Extract and verify token
			const authToken = request.cookies.authToken;
			if (!authToken) {
				return reply.status(401).send({ error: 'Unauthorized' });
			}

			// Decode token (assuming it's a JWT)
			const decoded = fastify.jwt.verify(authToken);
			console.log('decoded', decoded);

			if (
				!decoded ||
				!decoded.uuid ||
				!decoded.email ||
				!decoded.role ||
				!decoded.first ||
				!decoded.last ||
				!decoded.groups
			) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			const userRole = decoded.role;
			const userGroups = decoded.groups.map((g) => g.id); // Extract group IDs

			console.log('User Role:', userRole);
			console.log('User Groups:', userGroups);

			let query;
			let values = [];

			if (userRole === 'admin') {
				console.log('SQL for admin');
				query = `
                SELECT 
                    s.shift_id,
                    s.start_time,
                    s.end_time,
                    s.date,
                    s.description,
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    sg.name AS group_name,
                    st.name_long,
                    st.name_short
                FROM active_shifts s
                LEFT JOIN account u ON s.assigned_to = u.user_id
                JOIN schedule_groups sg ON s.schedule_group_id = sg.group_id
                JOIN shift_types st ON s.shift_type_id = st.shift_type_id
                WHERE s.schedule_group_id = ANY($1)
            `;
				values = [userGroups];
			} else if (userRole === 'maintainer') {
				console.log('SQL for maintainer');
				query = `
                SELECT 
                    s.shift_id,
                    s.start_time,
                    s.end_time,
                    s.date,
                    s.description,
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    sg.name AS group_name,
                    st.name_long,
                    st.name_short
                FROM active_shifts s
                LEFT JOIN account u ON s.assigned_to = u.user_id
                JOIN schedule_groups sg ON s.schedule_group_id = sg.group_id
                JOIN shift_types st ON s.shift_type_id = st.shift_type_id
            `;
			} else {
				return reply.status(403).send({ error: 'Access Denied' });
			}

			// Execute query
			const result = await client.query(
				query,
				values.length ? values : undefined
			);
			return reply.send(result.rows);
		} catch (error) {
			console.error('Error fetching active schedule:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to fetch active schedule' });
		} finally {
			client.release();
		}
	});

	fastify.delete('/remove-active-shifts', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			// Start transaction
			await client.query('BEGIN');

			// Extract and verify token
			const authToken = request.cookies.authToken;
			if (!authToken) {
				return reply.status(401).send({ error: 'Unauthorized' });
			}

			// Decode token (assuming it's a JWT)
			const decoded = fastify.jwt.verify(authToken);
			if (!decoded || !decoded.role) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			const userRole = decoded.role;

			// Check user permissions (only admins & maintainers can delete shifts)
			if (userRole !== 'admin' && userRole !== 'maintainer') {
				return reply.status(403).send({ error: 'Access Denied' });
			}

			// Extract IDs from the request body
			const { shift_ids } = request.body;
			if (!Array.isArray(shift_ids) || shift_ids.length === 0) {
				return reply
					.status(400)
					.send({ error: 'Invalid or empty shift_ids array' });
			}

			console.log('Deleting shifts:', shift_ids);

			// Perform bulk delete operation using PostgreSQL's `ANY($1)`
			const query = `
            DELETE FROM active_shifts
            WHERE shift_id = ANY($1)
            RETURNING shift_id;
        `;

			const result = await client.query(query, [shift_ids]);

			// If no rows were deleted, rollback and return an error
			if (result.rowCount === 0) {
				await client.query('ROLLBACK');
				return reply
					.status(404)
					.send({ error: 'No shifts found with the given IDs' });
			}

			// Commit transaction
			await client.query('COMMIT');

			return reply.send({
				message: 'Shifts deleted successfully',
				deleted_shifts: result.rows,
			});
		} catch (error) {
			console.error('Error deleting shifts:', error.message);

			// Rollback transaction on error
			await client.query('ROLLBACK');

			return reply.status(500).send({ error: 'Failed to delete shifts' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
