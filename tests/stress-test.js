import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
	insecureSkipTLSVerify: true,
	stages: [
		{ duration: '10s', target: 50 }, // Ramp-up to 50 users over 10 seconds
		{ duration: '10s', target: 0 }, // Ramp-down
	],
};

export default function () {
	const url = 'https://api.r3dsys.com/login';
	const payload = JSON.stringify({
		deviceId: '1b51f4347b2492349113f2dd65d148c8',
		email: 'ak8893@mau.se',
		password: 'Hnqtdtah123?',
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
