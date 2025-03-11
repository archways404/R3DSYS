import dgram from 'dgram';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config({
	path: '.env.development',
});

// Configure PostgreSQL connection pool
const pool = new Pool({
	connectionString: process.env.POSTGRES_URI, // Use full connection string
	max: process.env.PG_MAX || 10, // Optional: max pool connections
});

const server = dgram.createSocket('udp4');

const authLogsQueues = [[], []];
const generalLogsQueues = [[], []];
let activeAuthQueueIndex = 0;
let activeGeneralQueueIndex = 0;
//const AUTH_SWITCH_INTERVAL = 300000; // 5 minutes
const AUTH_SWITCH_INTERVAL = 60000; // 1 minute ( testing )
const GENERAL_SWITCH_INTERVAL = 60000; // 1 minute

function addToQueue(logData, queueType) {
	let queues, activeQueueIndex;
	if (queueType === 'auth') {
		queues = authLogsQueues;
		activeQueueIndex = activeAuthQueueIndex;
	} else if (queueType === 'general') {
		queues = generalLogsQueues;
		activeQueueIndex = activeGeneralQueueIndex;
	} else {
		console.error('❌ Invalid queue type:', queueType);
		return;
	}

	queues[activeQueueIndex].push(logData);
	console.log(
		`📥 Added log to ${queueType} Queue ${activeQueueIndex} (${queues[activeQueueIndex].length} logs)`
	);
}

async function flushQueue(queueIndex, queues, tableName) {
	const queue = queues[queueIndex];
	if (queue.length === 0) return;

	try {
		const client = await pool.connect();
		console.log(`✅ Inserting ${queue.length} logs into ${tableName}`);

		// Generate placeholders dynamically
		const columns =
			tableName === 'auth_logs'
				? ['user_id', 'ip_address', 'fingerprint', 'success', 'error_message']
				: [
						'user_id',
						'action_type',
						'success',
						'error_message',
						'creation_method',
				  ];

		const values = queue.map((log) =>
			tableName === 'auth_logs'
				? [
						log.user_id,
						log.ip_address,
						log.fingerprint,
						log.success,
						log.error_message,
				  ]
				: [
						log.user_id,
						log.action_type,
						log.success,
						log.error_message,
						log.creation_method,
				  ]
		);

		// Create parameterized placeholders
		const paramPlaceholders = values
			.map(
				(_, rowIndex) =>
					`(${columns
						.map(
							(_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`
						)
						.join(', ')})`
			)
			.join(', ');

		// Flatten values array for pg.query
		const flattenedValues = values.flat();

		// Execute batch insert query
		await client.query(
			`INSERT INTO ${tableName} (${columns.join(
				', '
			)}) VALUES ${paramPlaceholders}`,
			flattenedValues
		);

		client.release();
		queue.length = 0; // Clear queue after successful insert
	} catch (error) {
		console.error(`❌ Error inserting logs into ${tableName}:`, error);
	}
}

setInterval(() => {
	const oldAuthQueueIndex = activeAuthQueueIndex;
	activeAuthQueueIndex = (activeAuthQueueIndex + 1) % 2;
	console.log(`🔄 Switching active authLogs queue to ${activeAuthQueueIndex}`);
	flushQueue(oldAuthQueueIndex, authLogsQueues, 'auth_logs');
}, AUTH_SWITCH_INTERVAL);

setInterval(() => {
	const oldGeneralQueueIndex = activeGeneralQueueIndex;
	activeGeneralQueueIndex = (activeGeneralQueueIndex + 1) % 2;
	console.log(
		`🔄 Switching active generalLogs queue to ${activeGeneralQueueIndex}`
	);
	flushQueue(oldGeneralQueueIndex, generalLogsQueues, 'general_logs');
}, GENERAL_SWITCH_INTERVAL);

server.on('message', (msg) => {
	try {
		const logData = JSON.parse(msg.toString());
		if (logData.type === 'auth') {
			addToQueue(logData, 'auth');
		} else {
			addToQueue(logData, 'general');
		}
	} catch (error) {
		console.error('❌ Invalid log message:', error);
	}
});

server.bind(3001, () => {
	console.log('🚀 UDP Log Server listening on port 3001');
});


/* USED IN PROD
require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});
*/