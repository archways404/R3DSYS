import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
	stages: [
		{ duration: '10s', target: 50 }, // Ramp-up to 50 users over 10 seconds
		{ duration: '30s', target: 100 }, // Stay at 100 users for 30 seconds
		{ duration: '10s', target: 0 }, // Ramp-down
	],
};

export default function () {
	const url = 'https://api.r3dsys.com/login';
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

// brew install k6  # macOS
// choco install k6  # Windows
// sudo apt install k6  # Linux
