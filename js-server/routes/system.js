const { getServerStatus } = require('../functions/system/getServerStatus');
const {
	updateServerStatus,
} = require('../functions/system/updateServerStatus');

async function routes(fastify, options) {
	fastify.get('/', async (request, reply) => {
		const status = await getServerStatus(fastify);

		if (status.error) {
			return reply.status(500).send(status);
		}

		return reply.send(status);
	});

	fastify.put('/status/maintenance', async (request, reply) => {
		const { is_maintenance } = request.body;

		if (typeof is_maintenance !== 'boolean') {
			return reply
				.status(400)
				.send({ error: 'is_maintenance must be a boolean' });
		}

		const result = await updateServerStatus(fastify, { is_maintenance });
		return reply.send(result);
	});

	fastify.put('/status/display-survey', async (request, reply) => {
		const { display_survey } = request.body;

		if (typeof display_survey !== 'boolean') {
			return reply
				.status(400)
				.send({ error: 'display_survey must be a boolean' });
		}

		const result = await updateServerStatus(fastify, { display_survey });
		return reply.send(result);
	});

	fastify.put('/status/times', async (request, reply) => {
		const { start_time, end_time } = request.body;

		// Validate timestamps
		if (start_time && isNaN(Date.parse(start_time))) {
			return reply.status(400).send({ error: 'Invalid start_time format' });
		}

		if (end_time && isNaN(Date.parse(end_time))) {
			return reply.status(400).send({ error: 'Invalid end_time format' });
		}

		const result = await updateServerStatus(fastify, { start_time, end_time });
		return reply.send(result);
	});
}

module.exports = routes;
