const fastify = require('fastify');

const fs = require('fs');
const path = require('path');

const cors = require('@fastify/cors');
const fastifyCookie = require('@fastify/cookie');
const fastifySession = require('@fastify/session');

require('dotenv').config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN;

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

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET, // for signing cookies
	hook: 'onRequest',
});

app.register(fastifySession, {
	secret: process.env.SESSION_SECRET,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	},
	saveUninitialized: false,
});

// GLOBAL CORS
app.register(cors, {
	origin: CORS_ORIGIN,
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	maxAge: 86400,
});

// DATABASE CONNECTION
app.register(require('./connector'));

// Routes
app.register(require('./routes/auth'));

app.addHook('onReady', async () => {
	const client = await app.pg.connect();
	try {
		const res = await client.query('SELECT NOW()');
		app.log.info(`PostgreSQL connected: ${res.rows[0].now}`);

		client.on('error', async (err) => {
			console.error('❌ PostgreSQL LISTEN error:', err);
			console.log('⏳ Reconnecting to PostgreSQL...');

			try {
				client.release(); // Release the old client
				const newClient = await app.pg.connect();
				client = newClient;
				console.log('✅ Successfully reconnected to PostgreSQL LISTEN channels');
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

console.log('Starting Fastify...');

app
	.ready()
	.then(() => {
		return app.listen({ port: PORT, host: HOST });
	})
	.then((address) => {
		console.log(`🚀 Server listening at ${address}`);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
