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
import PasswordInput from '@/components/ui/PasswordInput';
import EmailInput from '@/components/ui/EmailInput';

import { useStateContext } from '../../context/RenderContext';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const navigate = useNavigate();
	const { checkAuth, setUser, setJustLoggedIn } = useContext(AuthContext);

	const { setRenderLoading } = useStateContext();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setError('Please fill in all fields.');
			return;
		}

		setIsLoggingIn(true);
		setRenderLoading(true); // Start loading

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

			const data = await response.json();

			if (response.status === 403 && data.unlock_time) {
				setError(
					`Your account is locked until ${new Date(
						data.unlock_time
					).toLocaleString()}`
				);
				setRenderLoading(false);
				return;
			}

			if (!response.ok)
				throw new Error(data.message || 'Invalid email or password');

			setUser(data.user);
			setJustLoggedIn(true);

			navigate('/welcome', { replace: true });
		} catch (error) {
			setError(error.message);
			setRenderLoading(false);
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
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="w-full max-w-md p-8 space-y-6 rounded-lg">
					<h1 className="text-5xl font-extrabold text-white tracking-wide drop-shadow-xl text-center">
						<span className="text-white">R</span>
						<span className="text-red-600">Ǝ</span>
						<span className="text-white">D</span>
						<span className="text-white">SYS</span>
					</h1>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<EmailInput
								value={email} // ✅ Pass value
								onChange={(e) => setEmail(e.target.value)} // ✅ Pass onChange handler
							/>
						</div>

						<div>
							<PasswordInput
								value={password} // ✅ Pass value
								onChange={(e) => setPassword(e.target.value)} // ✅ Pass onChange handler
							/>
						</div>
						<Button
							type="submit"
							disabled={isLoggingIn}
							className={`w-full px-4 py-2 mt-4 text-white rounded-md transition ${
								isLoggingIn
									? 'bg-red-300 cursor-not-allowed'
									: 'bg-red-600 hover:bg-red-700'
							}`}>
							{isLoggingIn ? 'Logging in...' : 'Login'}
						</Button>
					</form>

					<p className="text-sm text-center text-gray-600 dark:text-gray-400">
						Don't know your password?{' '}
						<Link
							to="/forgotpass"
							className="text-red-500 hover:underline">
							Reset it here
						</Link>
					</p>
				</div>
			</div>
		</Layout>
	);
}

export default Login;
