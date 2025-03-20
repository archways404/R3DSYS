const fastify = require('fastify');
const cors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
const jwt = require('@fastify/jwt');
const csfr = require('@fastify/csrf-protection');
const fastifyStatic = require('@fastify/static');
const rateLimit = require('@fastify/rate-limit');
const fastifyMultipart = require('@fastify/multipart');
const promClient = require('prom-client');
const metrics = require('fastify-metrics');
const fs = require('fs');
const path = require('path');
const os = require('os');
const fastifyRedis = require('@fastify/redis');

const { getAffectedUsers } = require('./functions/ical-creation');
const { getActiveShiftsForUser } = require('./functions/ical-creation');
const { generateICSFileForUser } = require('./functions/ical-creation');

const { updateHDCache } = require('./functions/cache');
const { handleHDCache } = require('./functions/cache');

const { updateStatusCache } = require('./functions/statusCache');
const { handleStatusCache } = require('./functions/statusCache');

require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET;

const key = fs.readFileSync('../certificates/server-key.pem');
const cert = fs.readFileSync('../certificates/server-cert.pem');

const app = fastify({
	logger: false,
	trustProxy: true, // Enables X-Forwarded-For support
	https: {
		key,
		cert,
	},
});

app.register(csfr, {
	cookieOpts: { httpOnly: true, secure: true, sameSite: 'Strict' },
});

app.register(cookie, {
	secret: JWT_SECRET,
	parseOptions: {
		httpOnly: true,
		sameSite: 'None',
		secure: process.env.NODE_ENV === 'production',
	},
});

app.register(jwt, {
	secret: JWT_SECRET,
	cookie: {
		cookieName: 'authToken',
		signed: false,
	},
});

// GLOBAL CORS
app.register(cors, {
	origin: CORS_ORIGIN,
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	maxAge: 86400,
});

app.addHook('preParsing', async (request, reply, payload) => {
	if (request.headers['content-type'] === 'application/json') {
		let rawBody = '';
		payload.on('data', (chunk) => {
			rawBody += chunk;
		});
		payload.on('end', () => {
			try {
				request.body = JSON.parse(rawBody);
			} catch (err) {
				reply.code(400).send({ message: 'Invalid JSON' });
			}
		});
	}
});

app.register(rateLimit, {
	max: 1500000,
	timeWindow: '1 minute',
});

app.register(fastifyMultipart);

app.register(fastifyRedis, {
	host: '127.0.0.1',
	port: 6379,
	password: '',
	retryStrategy: (times) => Math.min(times * 50, 2000),
});

// DATABASE CONNECTION
app.register(require('./connector'));

// Routes
app.register(require('./routes/authentication'));

app.register(require('./routes/serverpanel'));

app.register(require('./routes/shifts'));

app.register(require('./routes/account_management'));

app.register(require('./routes/template'));

app.register(require('./routes/statistics'));

app.register(require('./routes/schedule'));

app.register(require('./routes/status'));

app.register(require('./routes/groups'));

app.register(require('./routes/table_data'));

app.register(require('./routes/webhook'));

app.register(require('./routes/version'));

app.register(require('./routes/bugreport'));

app.register(require('./routes/system'));

app.register(require('./routes/ical'), {
	hook: 'preHandler',
	options: {
		cors: {
			origin: '*',
			credentials: false,
			allowedHeaders: ['Content-Type'],
			methods: ['GET', 'OPTIONS'],
		},
	},
});

app.register(fastifyStatic, {
	root: path.join(__dirname, './user_files'),
});

// Middleware
app.decorate('verifyJWT', async function (request, reply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

//  Register Prometheus Metrics for Request Duration
const requestDurationHistogram = new promClient.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.1, 0.5, 1, 2, 5, 10], // Buckets for request durations
});

//  Keep a Limited Array of Request Durations
const requestDurations = [];
const MAX_DURATION_ENTRIES = 1000;

// Middleware to track request duration
app.addHook('onRequest', (request, reply, done) => {
	request.startTime = process.hrtime(); // Capture start time
	done();
});

app.addHook('onResponse', (request, reply, done) => {
	// Exclude system stats & request duration routes from metrics
	const excludedRoutes = ['/system-stats', '/request-durations'];
	if (excludedRoutes.includes(request.raw.url)) {
		return done();
	}

	if (!request.startTime) {
		console.error(`❌ Missing start time for ${request.raw.url}`);
		return done();
	}

	const diff = process.hrtime(request.startTime);
	let durationInMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // Convert to ms & round

	// ✅ Ensure duration is not NaN
	if (isNaN(durationInMs)) {
		console.error(`❌ Duration NaN for ${request.raw.url}`);
		return done();
	}

	const durationInSeconds = durationInMs / 1000;

	requestDurationHistogram
		.labels(request.method, request.raw.url, reply.statusCode)
		.observe(durationInSeconds);

	if (requestDurations.length >= MAX_DURATION_ENTRIES) {
		requestDurations.shift();
	}

	requestDurations.push({
		method: request.method,
		url: request.raw.url,
		statusCode: reply.statusCode,
		duration: durationInMs, // ✅ Now rounded to whole numbers
		time: new Date().toISOString(),
	});

	console.log(`✅ Request to ${request.raw.url} took ${durationInMs} ms`);
	done();
});

app.get('/request-durations', (request, reply) => {
	const aggregatedDurations = {};

	// Aggregate durations per route
	requestDurations.forEach((entry) => {
		const key = `${entry.method} ${entry.url}`;
		if (!aggregatedDurations[key]) {
			aggregatedDurations[key] = {
				totalRequests: 0,
				totalDuration: 0,
				highestDuration: 0,
				lowestDuration: Infinity,
			};
		}

		aggregatedDurations[key].totalRequests += 1;
		aggregatedDurations[key].totalDuration += parseFloat(entry.duration);
		aggregatedDurations[key].highestDuration = Math.max(
			aggregatedDurations[key].highestDuration,
			parseFloat(entry.duration)
		);
		aggregatedDurations[key].lowestDuration = Math.min(
			aggregatedDurations[key].lowestDuration,
			parseFloat(entry.duration)
		);
	});

	// Compute averages
	Object.keys(aggregatedDurations).forEach((key) => {
		aggregatedDurations[key].avgDuration =
			aggregatedDurations[key].totalDuration /
			aggregatedDurations[key].totalRequests;
	});

	reply.send(aggregatedDurations);
});

app.get('/metrics', async (request, reply) => {
	try {
		const metricsData = await promClient.register.metrics();
		reply.type('text/plain').send(metricsData);
	} catch (error) {
		reply.code(500).send({ error: 'Failed to fetch metrics' });
	}
});

const getCpuUsage = () => {
	return new Promise((resolve) => {
		const startMeasure = os.cpus();

		setTimeout(() => {
			const endMeasure = os.cpus();
			let idleDiff = 0;
			let totalDiff = 0;

			for (let i = 0; i < startMeasure.length; i++) {
				const startCpu = startMeasure[i].times;
				const endCpu = endMeasure[i].times;

				const idle = endCpu.idle - startCpu.idle;
				const total =
					endCpu.user -
					startCpu.user +
					(endCpu.nice - startCpu.nice) +
					(endCpu.sys - startCpu.sys) +
					(endCpu.irq - startCpu.irq) +
					idle;

				idleDiff += idle;
				totalDiff += total;
			}

			const cpuUsage = 100 - (idleDiff / totalDiff) * 100;
			resolve(cpuUsage.toFixed(2)); // Return CPU usage as a percentage
		}, 500); // Measure CPU usage over 500ms for accuracy
	});
};

app.get('/system-stats', async (request, reply) => {
	try {
		const uptime = process.uptime(); // Get uptime in seconds

		// ✅ Memory Usage Calculation
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const usedMemory = totalMemory - freeMemory;
		const memoryUsage = (usedMemory / totalMemory) * 100;

		// ✅ Accurate CPU Usage
		const cpuUsage = await getCpuUsage();

		reply.send({
			uptime,
			totalMemory: (totalMemory / (1024 * 1024)).toFixed(2),
			freeMemory: (freeMemory / (1024 * 1024)).toFixed(2),
			usedMemory: (usedMemory / (1024 * 1024)).toFixed(2),
			memoryUsage: memoryUsage.toFixed(2),
			cpuUsage,
		});
	} catch (error) {
		reply.code(500).send({ error: 'Failed to fetch system stats' });
	}
});

app.listen({ port: PORT, host: HOST }, async function (err, address) {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});

// Check Redis connection on startup
app.after(() => {
	if (!app.redis || typeof app.redis.set !== 'function') {
		console.error('❌ Fastify Redis is not properly initialized');
	} else {
		console.log('✅ Fastify Redis plugin is working!');
	}
});

app.addHook('onReady', async () => {
	const client = await app.pg.connect();
	try {
		const res = await client.query('SELECT NOW()');
		app.log.info(`PostgreSQL connected: ${res.rows[0].now}`);

		await app.redis.del('version:data');
		console.log(`🗑 Cleared cache for version `);

		// Start listening for changes
		await client.query('LISTEN status_channel');
		await client.query('LISTEN active_shifts_channel');
		await client.query('LISTEN account_changes');
		await client.query('LISTEN group_changes');

		client.on('notification', handlePostgresNotification);

		client.on('error', async (err) => {
			console.error('❌ PostgreSQL LISTEN error:', err);
			console.log('⏳ Reconnecting to PostgreSQL...');

			try {
				client.release(); // Release the old, possibly broken client
				const newClient = await app.pg.connect();
				client = newClient;

				await client.query('LISTEN status_channel');
				await client.query('LISTEN active_shifts_channel');
				await client.query('LISTEN account_changes');
				await client.query('LISTEN group_changes');

				client.on('notification', handlePostgresNotification); // Re-attach listener
				console.log(
					'✅ Successfully reconnected to PostgreSQL LISTEN channels'
				);
			} catch (reconnectError) {
				console.error('❌ Failed to reconnect to PostgreSQL:', reconnectError);
				setTimeout(() => client.emit('error', reconnectError), 5000); // Retry after 5s
			}
		});
	} catch (err) {
		app.log.error('❌ PostgreSQL connection error:', err);
		throw new Error('PostgreSQL connection is not established');
	}
});

const handlePostgresNotification = async (msg) => {
	try {
		const payload = JSON.parse(msg.payload);
		console.log(`🔔 Notification from ${msg.channel}:`, payload);

		switch (msg.channel) {
			case 'active_shifts_channel':
				const userUUIDs = await getAffectedUsers(
					app,
					payload.schedule_group_id
				);
				for (const userUUID of userUUIDs) {
					const shifts = await getActiveShiftsForUser(app, userUUID);
					await generateICSFileForUser(userUUID, shifts);
				}
				break;

			case 'status_channel':
				await updateStatusCache(client);
				break;

			case 'account_changes':
				await app.redis.del(`${payload.email}:logindetails`);
				await app.redis.del(`${payload.user_id}:userinfo`);
				console.log(`🗑 Cleared cache for user ${payload.user_id}`);
				break;

			case 'group_changes':
				if (!payload.user_id || !payload.group_id) {
					console.error('❌ Received invalid group_changes payload:', payload);
					return;
				}

				// Delete user cache
				await app.redis.del(`${payload.user_id}:userinfo`);
				console.log(
					`🗑 Cleared cache for user ${payload.user_id} due to group change`
				);

				// ✅ Force refresh user data from the database
				await updateUserCache(payload.user_id);

				break;
		}
	} catch (error) {
		console.error('❌ Error handling database notification:', error);
	}
};

async function updateUserCache(userId) {
	try {
		const client = await app.pg.connect();

		// 🛠 Fetch full user details in **ONE QUERY**
		const userResult = await client.query(
			`SELECT a.user_id, a.email, a.first_name, a.last_name, a.role, 
                    json_agg(json_build_object('id', g.group_id, 'name', g.name)) AS groups
             FROM account a
             LEFT JOIN account_schedule_groups ag ON a.user_id = ag.user_id
             LEFT JOIN schedule_groups g ON ag.group_id = g.group_id
             WHERE a.user_id = $1
             GROUP BY a.user_id`,
			[userId]
		);
		client.release();

		// If user does not exist, skip caching
		if (userResult.rowCount === 0) {
			console.warn(`⚠ User ${userId} not found in DB`);
			return;
		}

		const user = userResult.rows[0];

		// ✅ Construct user object
		const userInfo = {
			uuid: user.user_id,
			email: user.email,
			first: user.first_name,
			last: user.last_name,
			role: user.role,
			groups: user.groups || [],
		};

		// ✅ Store fresh data in Redis
		await app.redis.setex(
			`${user.user_id}:userinfo`,
			900,
			JSON.stringify(userInfo)
		);
		console.log(`🔄 Updated cache for user ${userId} with fresh data`);
	} catch (error) {
		console.error(`❌ Failed to update user cache for ${userId}:`, error);
	}
}
		/*
		// Populate the cache on server boot
		await updateHDCache(client); // <-- Populate cache with data at boot

		await client.query('LISTEN slots_change');
		await client.query('LISTEN user_slots_change');

		client.on('notification', async (msg) => {
			if (msg.channel === 'slots_change') {
				console.log('Received notification from slots:', msg.payload);
				const slots = await getAssignedSlots(app);
				await generateICSFiles(slots);

				// Update the cache when slots change
				await updateHDCache(client); // <-- Refresh cache when slots change
			}

			if (msg.channel === 'user_slots_change') {
				console.log('Received notification from user_slots:', msg.payload);
				const slots = await getAssignedSlots(app);
				await generateICSFiles(slots);

				// Update the cache when slots change
				await updateHDCache(client); // <-- Refresh cache when slots change
			}
		});
		*/