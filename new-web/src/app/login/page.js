'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';

export default function Login() {
	const router = useRouter();
	const dispatch = useDispatch();

	const handleLogin = () => {
		// Fake user
		dispatch(
			login({
				name: 'Fake User',
				email: 'fake@example.com',
			})
		);
		router.push('/dashboard');
	};

	return (
		<button
			onClick={handleLogin}
			className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
			Go to dashboard
		</button>
	);
}
