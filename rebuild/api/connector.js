const fastifyPlugin = require('fastify-plugin');
require('dotenv').config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

async function connector(fastify, options) {
	fastify.register(require('@fastify/postgres'), {
		connectionString: process.env.POSTGRES_URI,
	});
}

module.exports = fastifyPlugin(connector);
