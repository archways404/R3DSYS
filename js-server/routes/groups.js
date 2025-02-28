async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.post('/create-schedule-group', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			await client.query('BEGIN');

			// Extract and verify token
			const authToken = request.cookies.authToken;
			if (!authToken) {
				return reply.status(401).send({ error: 'Unauthorized' });
			}

			const decoded = fastify.jwt.verify(authToken);
			if (!decoded || !decoded.uuid) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			const { name, description } = request.body;
			if (!name) {
				return reply.status(400).send({ error: 'Group name is required' });
			}

			console.log(`Creating new schedule group: ${name}`);

			// Step 1: Insert new schedule group
			const insertGroupQuery = `
                INSERT INTO schedule_groups (name, description) 
                VALUES ($1, $2) 
                RETURNING group_id;
            `;
			const groupResult = await client.query(insertGroupQuery, [
				name,
				description,
			]);
			const groupId = groupResult.rows[0].group_id;

			console.log(`New schedule group created with ID: ${groupId}`);

			// Step 2: Add current user to the new group
			const insertUserGroupQuery = `
                INSERT INTO account_schedule_groups (user_id, group_id)
                VALUES ($1, $2);
            `;
			await client.query(insertUserGroupQuery, [decoded.uuid, groupId]);

			console.log(`Added user ${decoded.uuid} to the new group ${groupId}`);

			// Commit transaction
			await client.query('COMMIT');

			return reply.send({
				message: 'Schedule group created successfully',
				group_id: groupId,
			});
		} catch (error) {
			console.error('Error creating schedule group:', error.message);
			await client.query('ROLLBACK');
			return reply
				.status(500)
				.send({ error: 'Failed to create schedule group' });
		} finally {
			client.release();
		}
	});

	fastify.delete('/delete-schedule-group/:group_id', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			await client.query('BEGIN'); // Start transaction

			// Extract and verify token
			const authToken = request.cookies.authToken;
			if (!authToken) {
				return reply.status(401).send({ error: 'Unauthorized' });
			}

			const decoded = fastify.jwt.verify(authToken);
			if (!decoded || !decoded.uuid || !decoded.role) {
				return reply.status(403).send({ error: 'Forbidden' });
			}

			// Only admins & maintainers can delete groups
			if (decoded.role !== 'admin' && decoded.role !== 'maintainer') {
				return reply.status(403).send({ error: 'Access Denied' });
			}

			const { group_id } = request.params;
			if (!group_id) {
				return reply.status(400).send({ error: 'Group ID is required' });
			}

			console.log(`Deleting schedule group: ${group_id}`);

			// Step 1: Check if the group exists
			const checkGroupQuery = `SELECT * FROM schedule_groups WHERE group_id = $1;`;
			const checkGroupResult = await client.query(checkGroupQuery, [group_id]);

			if (checkGroupResult.rowCount === 0) {
				await client.query('ROLLBACK');
				return reply.status(404).send({ error: 'Group not found' });
			}

			// Step 2: Delete the group (CASCADE will remove related records)
			const deleteGroupQuery = `DELETE FROM schedule_groups WHERE group_id = $1 RETURNING group_id;`;
			const deleteResult = await client.query(deleteGroupQuery, [group_id]);

			if (deleteResult.rowCount === 0) {
				await client.query('ROLLBACK');
				return reply.status(500).send({ error: 'Failed to delete group' });
			}

			console.log(`Successfully deleted group: ${group_id}`);

			// Commit transaction
			await client.query('COMMIT');

			return reply.send({
				message: 'Schedule group deleted successfully',
				group_id,
			});
		} catch (error) {
			console.error('Error deleting schedule group:', error.message);
			await client.query('ROLLBACK');
			return reply
				.status(500)
				.send({ error: 'Failed to delete schedule group' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
