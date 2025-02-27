import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const location = useLocation();
	const navigate = useNavigate();

	const isServerReachable = async () => {
		try {
			await fetch(import.meta.env.VITE_BASE_ADDR, { mode: 'no-cors' });
			return true;
		} catch {
			return false;
		}
	};

	const checkAuth = async () => {
		const reachable = await isServerReachable();
		if (!reachable) {
			console.log('Server is unreachable.');
			navigate('/offline'); // Redirect to offline page
			return;
		}

		try {
			const response = await axios.get(
				import.meta.env.VITE_BASE_ADDR + '/protected',
				{
					withCredentials: true,
					timeout: 3000,
				}
			);

			if (response.data && response.data.user) {
				setUser(response.data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			if (error.response?.status === 401) {
				console.log('Session expired, redirecting to login');
				setUser(null);
			} else {
				console.log('Error:', error.message);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (
			window.location.pathname === '/logout' ||
			window.location.pathname === '/offline'
		) {
			setLoading(false); // Don't trigger auth check if logging out
			return;
		}
		checkAuth();
	}, [location]);

	return (
		<AuthContext.Provider value={{ user, loading, setUser, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
}
