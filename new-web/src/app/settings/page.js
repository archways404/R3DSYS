'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Settings() {
	const user = useSelector((state) => state.auth.user);
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.push('/login'); // redirect unauthenticated users
		}
	}, [user, router]);

	if (!user) return null; // you can show a spinner here too

	return (
		<div className="p-8">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<p className="mt-4">Welcome, {user.name}. Here you can manage your account settings.</p>
		</div>
	);
}
