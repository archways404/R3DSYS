const { Temporal } = require('@js-temporal/polyfill');
const createRedDays = require('../functions/newschedule/createRedDays');

async function routes(fastify, options) {
	fastify.get('/schedule', async (request, reply) => {
		try {
			const { group_id } = request.query;

			if (!group_id || (Array.isArray(group_id) && group_id.length === 0)) {
				return reply.status(400).send({ error: 'At least one Group ID is required' });
			}

			const groupIds = Array.isArray(group_id) ? group_id : [group_id];
			const placeholders = groupIds.map((_, i) => `$${i + 1}`).join(', ');

			const query = `
			SELECT 
				asf.shift_id, 
				asf.shift_type_id, 
				st.name_long AS shift_type_long,
				st.name_short AS shift_type_short,
				asf.assigned_to, 
				acc.user_id AS assigned_user_id,
				acc.email AS assigned_user_email,
				acc.first_name AS assigned_user_first_name,
				acc.last_name AS assigned_user_last_name,
				asf.start_time, 
				asf.end_time, 
				asf.date, 
				asf.schedule_group_id
			FROM 
				active_shifts asf
			LEFT JOIN 
				shift_types st ON asf.shift_type_id = st.shift_type_id
			LEFT JOIN 
				account acc ON asf.assigned_to = acc.user_id
			WHERE 
				asf.schedule_group_id IN (${placeholders})
		`;

			const { rows } = await fastify.pg.query(query, groupIds);

			return reply.send(rows);
		} catch (error) {
			console.error('Error fetching active shifts:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch active shifts' });
		}
	});

	fastify.get('/redDays', async (request, reply) => {
		try {
			const { date } = request.query;

			if (!date) {
				return reply.status(400).send({ error: 'Missing date query param' });
			}

			const parsedDate = Temporal.PlainDate.from(date);
			const redDays = createRedDays(parsedDate);

			console.log(
				'Red days:',
				redDays.map((d) => d.toString())
			);

			// Convert to string before sending
			return reply.send(redDays.map((d) => d.toString()));
		} catch (error) {
			console.error('Error:', error.message);
			return reply.status(500).send({ error: 'Failed' });
		}
	});
  
  fastify.get('/shift/:id/edit-info', async (request, reply) => {
		const { id } = request.params;

		try {
			const shiftQuery = `
			SELECT s.*, a.first_name AS assigned_user_first_name, a.last_name AS assigned_user_last_name
			FROM active_shifts s
			LEFT JOIN account a ON s.assigned_to = a.user_id
			WHERE s.shift_id = $1
		`;

			const shiftResult = await fastify.pg.query(shiftQuery, [id]);
			if (shiftResult.rowCount === 0) return reply.status(404).send({ error: 'Shift not found' });
			const shift = shiftResult.rows[0];

			const groupUsersQuery = `
			SELECT u.user_id, u.first_name, u.last_name
			FROM account u
			INNER JOIN account_schedule_groups sg ON u.user_id = sg.user_id
			WHERE sg.group_id = $1
		`;

			const availableUsersQuery = `
			SELECT user_id FROM available_for_shift WHERE shift_id = $1
		`;

			const [groupUsersRes, availableRes] = await Promise.all([
				fastify.pg.query(groupUsersQuery, [shift.schedule_group_id]),
				fastify.pg.query(availableUsersQuery, [id]),
			]);

			const availableUserIds = new Set(availableRes.rows.map((r) => r.user_id));
			const users = groupUsersRes.rows.map((user) => ({
				...user,
				available: availableUserIds.has(user.user_id),
			}));

			return reply.send({ shift, users });
		} catch (err) {
			console.error(err);
			return reply.status(500).send({ error: 'Failed to fetch shift edit data' });
		}
	});

	fastify.post('/shift/:id/update', async (request, reply) => {
		const { id } = request.params;
		const { assigned_to, start_time, end_time } = request.body;

		try {
			await fastify.pg.query(
				`UPDATE active_shifts SET assigned_to = $1, start_time = $2, end_time = $3 WHERE shift_id = $4`,
				[assigned_to, start_time, end_time, id]
			);

			reply.send({ success: true });
		} catch (err) {
			console.error(err);
			reply.status(500).send({ error: 'Failed to update shift' });
		}
	});
}

module.exports = routes;
