const { login } = require('../functions/login');
const { getUserGroups } = require('../functions/login');

const { createNewUser } = require('../functions/register');
const { findUserByResetToken } = require('../functions/register');
const { userSetNewPassword } = require('../functions/register');
const { forgotPasswordSendEmail } = require('../functions/register');
const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		startRequest(request);
		if (!request.startTime) {
			request.startTime = process.hrtime();
		}
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		endRequest(request);
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.post(
		'/login',
		{
			config: {
				rateLimit: {
					max: 15,
					timeWindow: '15 minutes',
					keyGenerator: (req) => req.body?.deviceId || req.ip,
				},
			},
		},
		async (request, reply) => {
			const { email, password, deviceId } = request.body;
			// ✅ Get Real Client IP Address
			const forwardedIp = request.headers['x-forwarded-for'];
			const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : request.ip; // Take the first IP if multiple are present

			if (!deviceId) {
				return reply.status(400).send({ message: 'Device ID is required' });
			}

			const client = await fastify.pg.connect();
			fetchDataStart(request);

			try {
				// 🔹 Call the login function
				const loginResult = await login(fastify, client, email, password, ip, deviceId);

				// ✅ If login fails, return the structured error response
				if (loginResult.error) {
					return reply.status(loginResult.status).send({
						message: loginResult.error,
						unlock_time: loginResult.unlock_time || null,
					});
				}

				// 🔹 Generate JWT Token
				const authToken = fastify.jwt.sign(loginResult.user, {
					expiresIn: '15m',
				});

				const decoded = fastify.jwt.decode(authToken);
				loginResult.user.exp = decoded.exp; // Add exp field for frontend

				// Set authToken in Cookie
				reply.setCookie('authToken', authToken, {
					httpOnly: true,
					sameSite: 'None',
					secure: true,
					path: '/',
				});

				fetchDataEnd(request);
				return reply.send({
					message: 'Login successful',
					user: loginResult.user,
				});
			} catch (err) {
				console.error('Login Error:', err);
				fetchDataEnd(request);
				return reply.status(500).send({ message: 'Internal Server Error' });
			} finally {
				client.release();
			}
		}
	);

	// CREATES A NEW USER AND SENDS AN INVITE VIA EMAIL
	fastify.post('/register', async (request, reply) => {
		const { email, first_name, last_name, role, groups } = request.body;
		const client = await fastify.pg.connect();
		try {
			// Create new user
			const status = await createNewUser(client, email, first_name, last_name, role);

			if (status !== 'success') {
				return reply.send({ message: 'User creation failed' });
			}

			// Get the created user's ID
			const userResult = await client.query('SELECT user_id FROM account WHERE email = $1', [
				email,
			]);
			const userId = userResult.rows[0].user_id;

			// Assign groups
			if (groups && groups.length > 0) {
				const insertGroupQuery = `
				INSERT INTO account_schedule_groups (user_id, group_id)
				VALUES ${groups.map((_, i) => `($1, $${i + 2})`).join(', ')}
			`;
				await client.query(insertGroupQuery, [userId, ...groups]);
			}

			return reply.send({ message: 'User created successfully' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// VERIFIES THAT THE SET PASSWORD LINK (TOKEN) IS VALID
	fastify.get('/setPassword', async (request, reply) => {
		const { token } = request.query;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const user = await findUserByResetToken(client, token);

			fetchDataEnd(request);

			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE SET PASSWORD LINK (TOKEN)
	fastify.post('/setPassword', async (request, reply) => {
		const token = request.body.token;
		const password = request.body.password;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await userSetNewPassword(client, token, password);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// VERIFIES THE PASSWORD RESET LINK (TOKEN) IS VALID
	fastify.get('/resetPassword', async (request, reply) => {
		const { token } = request.query;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const user = await findUserByResetToken(client, token);

			fetchDataEnd(request);

			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE PASSWORD RESET LINK (TOKEN)
	fastify.post('/resetPassword', async (request, reply) => {
		const { token, password } = request.body;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await userSetNewPassword(client, token, password);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// SEND EMAIL WITH PASSWORD RESET LINK
	fastify.post('/forgotPassword', async (request, reply) => {
		const email = request.body.email;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await forgotPasswordSendEmail(client, email);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				console.error('Password reset error: Invalid or expired token');
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Email has been sent!' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	fastify.get('/protected', { preValidation: fastify.verifyJWT }, async (request, reply) => {
		const user = request.user;
		const userInfoCacheKey = `${user.uuid}:userinfo`;
		let userData = user; // Default to JWT payload
		let newAuthToken = null;

		try {
			// 🔹 Check if JWT token needs to be refreshed
			const tokenExpTime = user.exp * 1000 - Date.now();
			let cachedUserData = await fastify.redis.get(userInfoCacheKey);
			let cacheRefreshed = false;

			if (cachedUserData) {
				cachedUserData = JSON.parse(cachedUserData);

				// 🔹 Check if groups in cache differ from groups in JWT
				const groupsChanged = JSON.stringify(user.groups) !== JSON.stringify(cachedUserData.groups);

				if (groupsChanged) {
					console.log(`🔄 User groups changed for ${user.uuid}, refreshing JWT...`);
					userData = cachedUserData;
					cacheRefreshed = true;
				}

				// ✅ Refresh cache TTL regardless
				await fastify.redis.expire(userInfoCacheKey, 900); // Extend TTL
			} else {
				// ❌ Cache miss: Fetch from DB
				const userGroups = await getUserGroups(fastify.pg, user.uuid);
				userData = {
					uuid: user.uuid,
					email: user.email,
					role: user.role,
					first: user.first,
					last: user.last,
					notification_email: user.notification_email, // Add this
					teams_email: user.teams_email, // Add this
					groups: userGroups,
				};

				// 🔹 Store the fresh user data in Redis
				await fastify.redis.setex(userInfoCacheKey, 900, JSON.stringify(userData)); // 15 min TTL
				cacheRefreshed = true;
			}

			// 🔹 If token is about to expire OR group changed, refresh JWT
			if (tokenExpTime < 5 * 60 * 1000 || cacheRefreshed) {
				newAuthToken = fastify.jwt.sign(userData, { expiresIn: '45m' });

				// 🔹 Update Cookie with new token
				reply.setCookie('authToken', newAuthToken, {
					httpOnly: true,
					sameSite: 'None',
					secure: true,
					path: '/',
				});
			}

			let exp = user.exp;
			if (newAuthToken) {
				const decoded = fastify.jwt.decode(newAuthToken);
				exp = decoded.exp;
			}

			return reply.send({
				message: 'You are authenticated',
				user: { ...userData, exp },
				tokenRefreshed: !!newAuthToken,
			});
		} catch (err) {
			console.error('❌ Redis or Database Error:', err);
			return reply.status(500).send({ error: 'Internal Server Error' });
		}
	});

	fastify.post('/logout', async (request, reply) => {
		reply.clearCookie('authToken', {
			path: '/',
			httpOnly: true,
			sameSite: 'None',
			secure: true,
		});

		return reply.send({ message: 'Logged out successfully' });
	});
}

module.exports = routes;
