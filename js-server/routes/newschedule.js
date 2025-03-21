const { Temporal } = require('@js-temporal/polyfill');
const createRedDays = require('../functions/newschedule/createRedDays');

async function routes(fastify, options) {
	fastify.get('/schedule', async (request, reply) => {
		try {
			const { group_id } = request.query;

			if (!group_id) {
				return reply.status(400).send({ error: 'Group ID is required' });
			}

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
				asf.schedule_group_id = $1
		`;

			const { rows } = await fastify.pg.query(query, [group_id]);

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
}

module.exports = routes;
