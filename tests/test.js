const net = require('net');
const client = net.createConnection({ host: '127.0.0.1', port: 4000 }, () => {
	client.write('update\n');
	console.log('message sent');
	client.end();
});

client.on('error', (err) => {
	console.error('Connection error:', err.message);
});
