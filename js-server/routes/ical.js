const path = require('path');
const fs = require('fs');

async function routes(fastify, options) {
	// Register static file serving (if not already registered)
	fastify.register(require('@fastify/static'), {
		root: path.join(__dirname, '../user_files'),
		prefix: '/ical/',
	});

	// Serve the ICS file with proper caching headers
	fastify.get('/ical/:uuid', async (request, reply) => {
		const { uuid } = request.params;
		const filePath = path.join(__dirname, '../user_files', `${uuid}.ical`);

		if (fs.existsSync(filePath)) {
			// Ensure Google Calendar fetches the latest file
			reply.header('Content-Type', 'text/calendar; charset=utf-8');
			reply.header('Content-Disposition', `inline; filename="${uuid}.ical"`);
			reply.header(
				'Cache-Control',
				'no-store, no-cache, must-revalidate, proxy-revalidate'
			);
			reply.header('Pragma', 'no-cache');
			reply.header('Expires', '0');

			// Stream the file for efficiency
			return reply.send(fs.createReadStream(filePath));
		} else {
			return reply.status(404).send({ error: 'File not found' });
		}
	});
}

module.exports = routes;
