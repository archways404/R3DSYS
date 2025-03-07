import dgram from 'dgram';
import pg from 'pg';
import dotenv from 'dotenv';

/*
require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});
*/

const { Pool } = pg; // ✅ Fix for 'pg' import

dotenv.config({
	path: '.env.development',
});

// Configure PostgreSQL connection pool
const pool = new Pool({
	connectionString: process.env.POSTGRES_URI, // Use full connection string
	max: process.env.PG_MAX || 10, // Optional: max pool connections
});

const server = dgram.createSocket('udp4');

// Main queues
const queue1 = [];
const queue2 = [];

// Waiting queues
const wq1 = [];
const wq2 = [];

// Lock states
let lock_q1 = false;
let lock_q2 = false;

// Track last insert time
let lastInsertTime_q1 = Date.now();
let lastInsertTime_q2 = Date.now();

const MAX_QUEUE_SIZE = 10; // Maximum before switching to waiting queue
const CHECK_INTERVAL = 60000; // Check queues every 1 minute
const IDLE_INSERT_INTERVAL = 300000; // 5 minutes without new data

// Function to add logs to the correct queue
function addToQueue(logData) {
	const { Process, ...log } = logData;
	const currentTime = Date.now();

	if (Process === 'q1') {
		if (!lock_q1 && queue1.length < MAX_QUEUE_SIZE) {
			queue1.push(log);
			lastInsertTime_q1 = currentTime; // Update last insert time
			console.log(`📥 Added to Queue1 (${queue1.length} logs)`);
		} else {
			wq1.push(log);
			console.log(
				`📥 Queue1 locked! Added to Waiting Queue1 (${wq1.length} logs)`
			);
		}
	} else if (Process === 'q2') {
		if (!lock_q2 && queue2.length < MAX_QUEUE_SIZE) {
			queue2.push(log);
			lastInsertTime_q2 = currentTime; // Update last insert time
			console.log(`📥 Added to Queue2 (${queue2.length} logs)`);
		} else {
			wq2.push(log);
			console.log(
				`📥 Queue2 locked! Added to Waiting Queue2 (${wq2.length} logs)`
			);
		}
	} else {
		console.warn(`⚠️ Unknown Process Type: ${Process}`);
	}
}

// Function to flush logs from a queue to PostgreSQL
async function flushQueue(queue, tableName, lockVar, setUnlockCallback) {
	if (queue.length === 0) return;

	try {
		const client = await pool.connect();
		client.release();
		console.log(`✅ Inserted ${queue.length} logs into ${tableName}`);

		// Unlock the queue after inserting
		setUnlockCallback(false);
		queue.length = 0; // Clear the queue
	} catch (error) {
		console.error(`❌ Error inserting logs into ${tableName}:`, error);
	}
}

// UDP message listener
server.on('message', (msg, rinfo) => {
	try {
		const logData = JSON.parse(msg.toString());
		addToQueue(logData);
	} catch (error) {
		console.error('❌ Invalid log message:', error);
	}
});

// Periodic queue checking
setInterval(() => {
	const currentTime = Date.now();

	// Check Queue1: If full, lock and flush
	if (queue1.length >= MAX_QUEUE_SIZE) {
		lock_q1 = true;
		flushQueue(queue1, 'auth_logs_q1', lock_q1, (status) => (lock_q1 = status));
	} else if (
		!lock_q1 &&
		currentTime - lastInsertTime_q1 >= IDLE_INSERT_INTERVAL
	) {
		// If idle for 5 minutes, flush logs
		flushQueue(queue1, 'auth_logs_q1', lock_q1, (status) => (lock_q1 = status));
	}

	// Check Queue2: If full, lock and flush
	if (queue2.length >= MAX_QUEUE_SIZE) {
		lock_q2 = true;
		flushQueue(queue2, 'auth_logs_q2', lock_q2, (status) => (lock_q2 = status));
	} else if (
		!lock_q2 &&
		currentTime - lastInsertTime_q2 >= IDLE_INSERT_INTERVAL
	) {
		flushQueue(queue2, 'auth_logs_q2', lock_q2, (status) => (lock_q2 = status));
	}

	// Move waiting queue logs into main queues if space is available
	while (queue1.length < MAX_QUEUE_SIZE && wq1.length > 0) {
		queue1.push(wq1.shift());
		console.log(`🔄 Moved log from Waiting Queue1 to Queue1`);
	}

	while (queue2.length < MAX_QUEUE_SIZE && wq2.length > 0) {
		queue2.push(wq2.shift());
		console.log(`🔄 Moved log from Waiting Queue2 to Queue2`);
	}
}, CHECK_INTERVAL);

// Start the UDP server
server.bind(3001, () => {
	console.log('🚀 UDP Log Server listening on port 3001');
});
