const fs = require('fs').promises;
const path = require('path');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		request.startTime = process.hrtime();
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		const duration = process.hrtime(request.startTime);
		const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);
		console.log(`Request to ${request.url} took ${durationMs} ms`);
		done();
	});

	// ✅ Cache key for Redis
	const cacheKey = 'version:data';
	const versionFilePath = path.join(__dirname, '../../version.json');

	// ✅ Function to fetch and store version data in Redis
	async function getVersionData() {
		let versionData;

		// Step 1: Check Redis cache
		const cachedData = await fastify.redis.get(cacheKey);
		if (cachedData) {
			console.log('✅ Redis Cache Hit');
			return JSON.parse(cachedData);
		}

		// Step 2: Read from file if not cached
		console.log('❌ Cache Miss - Reading from file');
		try {
			const data = await fs.readFile(versionFilePath, 'utf8');
			versionData = JSON.parse(data);

			// Store in Redis cache (Expire after 1 hour)
			await fastify.redis.set(
				cacheKey,
				JSON.stringify(versionData),
				'EX',
				3600
			);
		} catch (err) {
			console.error('❌ Error reading version file:', err);
			versionData = { error: 'Failed to load version data' };
		}

		return versionData;
	}

	// ✅ API Route: Serve version data
	fastify.get('/version', async (request, reply) => {
		const versionData = await getVersionData();
		reply.send(versionData);
	});

	// ✅ API Route: Force refresh cache (e.g., after a deployment)
	fastify.post('/version/reload', async (request, reply) => {
		try {
			const data = await fs.readFile(versionFilePath, 'utf8');
			const versionData = JSON.parse(data);

			// Update Redis cache
			await fastify.redis.set(
				cacheKey,
				JSON.stringify(versionData),
				'EX',
				3600
			);
			reply.send({ message: 'Version cache reloaded', data: versionData });
		} catch (err) {
			console.error('❌ Error reloading version file:', err);
			reply.status(500).send({ message: 'Failed to reload version data' });
		}
	});
}

module.exports = routes;
