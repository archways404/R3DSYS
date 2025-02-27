import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Layout from '../../components/Layout';

function SetPass() {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const token = searchParams.get('token');

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!password || !confirmPassword) {
			setError('Please fill in both fields.');
			return;
		}

		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/setPassword',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						token,
						password,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to set password. Try again.');
			}

			setMessage('Your password has been successfully set.');
			setError('');

			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<Layout>
			<div className="flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md p-8 space-y-6 rounded-lg">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Set Your Password
					</h2>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					{message && (
						<p className="text-green-500 text-sm text-center">{message}</p>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								New Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:text-white"
								placeholder="Enter your new password"
								required
							/>
						</div>

						<div>
							<Label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:text-white"
								placeholder="Confirm your new password"
								required
							/>
						</div>

						<Button
							type="submit"
							className="w-full px-4 py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
							Set Password
						</Button>
					</form>
				</div>
			</div>
		</Layout>
	);
}

export default SetPass;
