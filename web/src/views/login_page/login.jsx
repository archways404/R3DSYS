import { useState, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import Layout from '../../components/Layout';
import DisplayStatus from '../../components/DisplayStatus';
import { AuthContext } from '../../context/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const navigate = useNavigate();
	const { checkAuth, setUser, setJustLoggedIn } = useContext(AuthContext); // ✅ Added setUser & setJustLoggedIn

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setError('Please fill in all fields.');
			return;
		}

		setIsLoggingIn(true);

		try {
			// Load the fingerprintjs agent
			const fp = await FingerprintJS.load();
			const result = await fp.get();
			const deviceId = result.visitorId;

			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password, deviceId }),
			});

			if (!response.ok) throw new Error('Invalid email or password');

			const userData = await response.json(); // ✅ Get user data from login response
			setUser(userData.user); // ✅ Set user immediately
			setJustLoggedIn(true); // ✅ Prevent rechecking auth on /welcome

			navigate('/welcome', { replace: true });
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoggingIn(false);
		}
	};

	if (isLoggingIn) {
		return (
			<Layout>
				<LoadingScreen />
			</Layout>
		);
	}

	return (
		<Layout>
			{/*
			<div className="absolute bottom-4 right-4">
				<DisplayStatus />
			</div>
			*/}
			<div className="flex items-center justify-center max-h-screen">
				<div className="w-full max-w-md p-8 space-y-6 rounded-lg">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Login to Your Account
					</h2>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:text-white"
								placeholder="Enter your email"
								required
							/>
						</div>

						<div>
							<Label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:text-white"
								placeholder="Enter your password"
								required
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoggingIn}
							className={`w-full px-4 py-2 mt-4 text-white rounded-md transition ${
								isLoggingIn
									? 'bg-green-300 cursor-not-allowed'
									: 'bg-green-600 hover:bg-green-700'
							}`}>
							{isLoggingIn ? 'Logging in...' : 'Login'}
						</Button>
					</form>

					<p className="text-sm text-center text-gray-600 dark:text-gray-400">
						Don't know your password?{' '}
						<Link
							to="/forgotpass"
							className="text-green-500 hover:underline">
							Reset it here
						</Link>
					</p>
				</div>
			</div>
		</Layout>
	);
}

export default Login;
