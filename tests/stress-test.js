import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
	insecureSkipTLSVerify: true,
	stages: [
		{ duration: '10s', target: 50 }, // Ramp-up to 50 users over 10 seconds
		{ duration: '30s', target: 100 }, // Stay at 100 users for 30 seconds
		{ duration: '10s', target: 0 }, // Ramp-down
	],
};

export default function () {
	const url = 'https://localhost:3000/login';
	const payload = JSON.stringify({
		deviceId: '',
		email: '',
		password: '',
	});

	const params = {
		headers: { 'Content-Type': 'application/json' },
	};

	const res = http.post(url, payload, params);

	check(res, {
		'is status 200': (r) => r.status === 200,
		'is login successful': (r) =>
			JSON.parse(r.body).message === 'Login successful',
	});

	sleep(1); // Wait 1s before next request
}

// k6 run stress-test.js

// k6 run stress-test.js --out json=results.json
