//import dgram from 'dgram';
const dgram = require('dgram');

const client = dgram.createSocket('udp4');
const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 3001;

// Function to send a log message
function createLog(logData) {
	const message = Buffer.from(JSON.stringify(logData));

	client.send(message, SERVER_PORT, SERVER_HOST, (err) => {
		if (err) {
			console.error('❌ Error sending log:', err);
		} else {
			console.log('✅ Log sent successfully');
		}
	});
}

// EXAMPLE USAGE
/*
createLog({
    type: 'auth',
    user_id: user.user_id,
    ip_address: ip,
    fingerprint: deviceId,
    success: true,
    error_message: null,
});
*/

module.exports = { createLog };
