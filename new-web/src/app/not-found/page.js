'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
			<h1 className="text-4xl font-bold mb-4">404</h1>
			<p className="text-lg text-gray-500 mb-6">Oops! Page not found.</p>
			<button
				onClick={() => router.push('/')}
				className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
				Go Home
			</button>
		</div>
	);
}
