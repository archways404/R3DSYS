const fastify = require('fastify');
const cors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
const jwt = require('@fastify/jwt');
const csfr = require('@fastify/csrf-protection');
const fastifyStatic = require('@fastify/static');
const rateLimit = require('@fastify/rate-limit');
const metrics = require('fastify-metrics');
const fs = require('fs');
const path = require('path');

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

app.register(require('./routes/table_data'));

app.register(require('./routes/webhook'));

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

app.register(metrics, {
	endpoint: '/metrics',
	blacklist: ['/healthcheck', '/favicon.ico'],
	metrics: {
		gauge: { enabled: true },
		counter: { enabled: true },
		histogram: { enabled: true },
		timing: { enabled: true },
	},
});

/* REQUEST DURATIONS
const requestDurations = [];

// Middleware to track request duration
app.addHook('onRequest', (request, reply, done) => {
	request.startTime = process.hrtime(); // Capture the start time
	done();
});

app.addHook('onResponse', (request, reply, done) => {
	const diff = process.hrtime(request.startTime); // Capture the end time
	const durationInMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds

	// Store the duration along with request details
	requestDurations.push({
		method: request.method,
		url: request.raw.url,
		statusCode: reply.statusCode,
		duration: durationInMs.toFixed(2) + 'ms',
		time: new Date().toISOString(),
	});

	// Log the request details for debugging
	console.log(`Request to ${request.raw.url} took ${durationInMs} ms`);

	done();
});

// Serve request duration data
app.get('/request-durations', (request, reply) => {
	reply.send(requestDurations);
});
*/

app.listen({ port: PORT, host: HOST }, async function (err, address) {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});

app.addHook('onReady', async () => {
	const client = await app.pg.connect();
	try {
		const res = await client.query('SELECT NOW()');
		app.log.info(`PostgreSQL connected: ${res.rows[0].now}`);

		await updateStatusCache(client); // <-- Populate cache with data at boot

		// Start listening for changes
		await client.query('LISTEN status_channel');
		await client.query('LISTEN active_shifts_channel');

		client.on('notification', async (msg) => {
			if (msg.channel === 'active_shifts_channel') {
				const payload = JSON.parse(msg.payload);
				console.log('Notification received:', payload);

				// Get the list of affected user UUIDs.
				const userUUIDs = await getAffectedUsers(
					app,
					payload.schedule_group_id
				);
				console.log('User UUIDs in group:', userUUIDs);

				// For each user, get their active shifts and create an ICS file.
				for (const userUUID of userUUIDs) {
					const shifts = await getActiveShiftsForUser(app, userUUID);
					console.log(`Active shifts for user ${userUUID}:`, shifts);
					try {
						await generateICSFileForUser(userUUID, shifts);
					} catch (error) {
						console.error(`Error generating ICS for user ${userUUID}:`, error);
					}
				}
			}

			if (msg.channel === 'status_channel') {
				const payload = JSON.parse(msg.payload);
				console.log('Notification received:', payload);
				await updateStatusCache(client); // <-- Populate cache with data at boot
			}
		});

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
	} catch (err) {
		app.log.error('PostgreSQL connection error:', err);
		throw new Error('PostgreSQL connection is not established');
	}
});