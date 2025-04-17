'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';

import EmailInput from '@/components/ui/email';
import PasswordInput from '@/components/ui/password';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();
	const dispatch = useDispatch();

	const handleLogin = () => {
		console.log('Entered email:', email);
		console.log('Entered password:', password);
		dispatch(
			login({
				name: 'Fake User',
				email: 'fake@example.com',
				role: 'admin',
			})
		);
		router.push('/dashboard');
	};

	return (
		<>
			<EmailInput
				value={password}
				onChange={setEmail}
			/>
			<PasswordInput
				value={password}
				onChange={setPassword}
			/>
			<button
				onClick={handleLogin}
				className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
				Go to dashboard
			</button>
		</>
	);
}
