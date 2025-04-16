async function routes(fastify, options) {
	fastify.post('/login', async (request, reply) => {
		const { email, password, deviceId } = request.body;
		const forwardedIp = request.headers['x-forwarded-for'];
		const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : request.ip;

		if (!deviceId) {
			return reply.status(400).send({ message: 'Device ID is required' });
		}

		const client = await fastify.pg.connect();
		try {
			// TODO: Replace this with real authentication logic
			const fakeUser = { id: 1, email };

			// Save session data
			request.session.user = {
				id: fakeUser.id,
				email: fakeUser.email,
				deviceId,
				ip,
			};

			return reply.send({
				message: 'Login successful',
				user: request.session.user,
			});
		} catch (err) {
			console.error('Login Error:', err);
			return reply.status(500).send({ message: 'Internal Server Error' });
		} finally {
			client.release();
		}
	});

	// Example: check session
	fastify.get('/me', async (request, reply) => {
		if (!request.session.user) {
			return reply.status(401).send({ message: 'Not logged in' });
		}
		return reply.send({ user: request.session.user });
	});

	// Logout endpoint
	fastify.post('/logout', async (request, reply) => {
		if (request.session?.sessionId) {
			request.sessionStore.destroy(request.session.sessionId, (err) => {
				if (err) {
					console.error('Session destroy failed:', err);
				}
			});
			request.session = null;
		}
		reply.send({ message: 'Logged out' });
	});
}

module.exports = routes;
