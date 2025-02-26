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

const { createAuthLog } = require('../functions/db_logs');

const argon2 = require('argon2');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		startRequest(request);
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
					max: 15000000,
					timeWindow: '15 minutes',
					keyGenerator: (req) => req.body?.deviceId || req.ip,
				},
			},
		},
		async (request, reply) => {
			const { email, password, deviceId } = request.body;
			const ip = request.ip;

			if (!deviceId) {
				return reply.status(400).send({ message: 'Device ID is required' });
			}

			const client = await fastify.pg.connect();
			fetchDataStart(request);

			try {
				// 🔹 Step 1: Check Redis for login details (email, uuid, password hash)
				const loginCacheKey = `${email}:logindetails`;
				let loginDetails = await fastify.redis.get(loginCacheKey);
				let userId, storedHash;

				if (loginDetails) {
					// ✅ Redis Cache Hit - Use cached login details
					loginDetails = JSON.parse(loginDetails);
					userId = loginDetails.uuid;
					storedHash = loginDetails.password;
				} else {
					// ❌ Cache Miss - Fetch from PostgreSQL
					const userResult = await client.query(
						'SELECT user_id, password FROM account WHERE email = $1',
						[email]
					);

					if (userResult.rows.length === 0) {
						throw new Error('Account with email does not exist');
					}

					userId = userResult.rows[0].user_id;
					storedHash = userResult.rows[0].password;

					// 🔹 Cache login details for future logins (expires in 15 minutes)
					await fastify.redis.set(
						loginCacheKey,
						JSON.stringify({ uuid: userId, email, password: storedHash }),
						'EX',
						900 // 15 minutes expiry
					);
				}

				// 🔹 Step 2: Verify Password Hash
				const isPasswordValid = await argon2.verify(storedHash, password);
				if (!isPasswordValid) {
					throw new Error('Invalid password');
				}

				// 🔹 Step 3: Fetch or Cache User Profile Data
				const userInfoCacheKey = `${userId}:userinfo`;
				let userData = await fastify.redis.get(userInfoCacheKey);

				if (userData) {
					// ✅ User info cache hit
					userData = JSON.parse(userData);
				} else {
					// ❌ User info cache miss - Fetch from DB
					const userGroups = await getUserGroups(client, userId);
					const userProfile = await client.query(
						'SELECT first_name, last_name, role FROM account WHERE user_id = $1',
						[userId]
					);

					if (userProfile.rows.length === 0) {
						throw new Error('User profile not found');
					}

					// 🔹 Construct user profile data
					userData = {
						uuid: userId,
						email,
						role: userProfile.rows[0].role,
						first: userProfile.rows[0].first_name,
						last: userProfile.rows[0].last_name,
						groups: userGroups,
					};

					// 🔹 Store user profile in Redis (expires in 15 minutes)
					await fastify.redis.set(
						userInfoCacheKey,
						JSON.stringify(userData),
						'EX',
						900
					);
				}

				// 🔹 Step 4: Generate JWT Token
				const authToken = fastify.jwt.sign(userData, { expiresIn: '15m' });

				// 🔹 Set authToken in Cookie
				reply.setCookie('authToken', authToken, {
					httpOnly: true,
					sameSite: 'None',
					secure: true,
					path: '/',
				});

				await createAuthLog(client, userId, ip, deviceId, true, null);
				fetchDataEnd(request);

				return reply.send({
					message: 'Login successful',
					user: userData, // ✅ Sending cached user profile data
				});
			} catch (err) {
				console.error('Login Error:', err);
				fetchDataEnd(request);
				return reply
					.status(500)
					.send({ message: err.message || 'Internal Server Error' });
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
			const status = await createNewUser(
				client,
				email,
				first_name,
				last_name,
				role
			);

			if (status !== 'success') {
				return reply.send({ message: 'User creation failed' });
			}

			// Get the created user's ID
			const userResult = await client.query(
				'SELECT user_id FROM account WHERE email = $1',
				[email]
			);
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

	fastify.get(
		'/protected',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			const user = request.user;
			const cacheKey = `${user.uuid}:userinfo`;

			try {
				// 🔹 Check if JWT token needs to be refreshed first
				const tokenExpTime = user.exp * 1000 - Date.now();
				let newAuthToken = null;
				let userData = user; // Default to JWT payload

				if (tokenExpTime < 5 * 60 * 1000) {
					// 🔹 Token is about to expire, refresh it

					// Try to get user data from Redis first
					const cachedUserData = await fastify.redis.get(cacheKey);

					if (cachedUserData) {
						// ✅ Cache hit: Use cached user data
						userData = JSON.parse(cachedUserData);
					} else {
						// ❌ Cache miss: Fetch user data from DB
						const userGroups = await getUserGroups(fastify.pg, user.uuid);
						userData = {
							uuid: user.uuid,
							email: user.email,
							role: user.role,
							first: user.first,
							last: user.last,
							groups: userGroups,
						};

						// 🔹 Store the fresh user data in Redis
						await fastify.redis.set(
							cacheKey,
							JSON.stringify(userData),
							'EX',
							900
						);
					}

					// Generate a fresh token
					newAuthToken = fastify.jwt.sign(userData, { expiresIn: '45m' });

					// 🔹 Update Cookie with new token
					reply.setCookie('authToken', newAuthToken, {
						httpOnly: true,
						sameSite: 'None',
						secure: true,
						path: '/',
					});
				}

				// 🔹 Return user info **without hitting Redis or DB unless needed**
				return reply.send({
					message: 'You are authenticated',
					user: userData,
					tokenRefreshed: !!newAuthToken,
				});
			} catch (err) {
				console.error('❌ Redis or Database Error:', err);
				return reply.status(500).send({ error: 'Internal Server Error' });
			}
		}
	);

	/*
	fastify.get(
		'/protected',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			const user = request.user;
			console.log('user: ', user);
			const authToken = fastify.jwt.sign(
				{
					uuid: user.uuid,
					email: user.email,
					role: user.role,
					first: user.first,
					last: user.last,
				},
				{ expiresIn: '15m' }
			);

			reply.setCookie('authToken', authToken, {
				httpOnly: true,
				sameSite: 'None',
				secure: true,
				path: '/',
			});

			return reply.send({
				message: 'You are authenticated and token has been refreshed',
				user: user,
			});
		}
	);
	*/

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
