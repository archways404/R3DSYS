const { getServerStatus } = require('../functions/system/getServerStatus');

async function routes(fastify, options) {
	fastify.get('/', async (request, reply) => {
		const status = await getServerStatus(fastify);

		if (status.error === 'Server status not found') {
			return reply.status(404).send(status);
		}

		if (status.error) {
			return reply.status(500).send(status);
		}

		return reply.send(status);
	});
}

module.exports = routes;
