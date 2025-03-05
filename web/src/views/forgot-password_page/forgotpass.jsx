import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import EmailInputSubmit from '@/components/ui/EmailInputSubmit';

import Layout from '../../components/Layout';

function ForgotPass() {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email) {
			setError('Please enter your email.');
			return;
		}

		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/forgotPassword',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						email,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send reset link. Please check your email.');
			}

			setError('');
			setMessage('Password reset link has been sent to your email.');
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<Layout>
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="w-full max-w-md p-8 space-y-6 rounded-lg">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Reset Your Password
					</h2>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					{message && (
						<p className="text-green-500 text-sm text-center">{message}</p>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<EmailInputSubmit
								value={email} // ✅ Pass state
								onChange={(e) => setEmail(e.target.value)} // ✅ Update state
								onSubmit={handleSubmit} // ✅ Handle form submission
							/>
						</div>
					</form>

					<p className="text-sm text-center text-gray-600 dark:text-gray-400">
						Back to{' '}
						<Link
							to="/login"
							className="text-green-500 hover:underline">
							Login
						</Link>
					</p>
				</div>
			</div>
		</Layout>
	);
}

export default ForgotPass;
