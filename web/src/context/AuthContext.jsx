import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [justLoggedIn, setJustLoggedIn] = useState(false); // ✅ New state
	const [justLoggedOut, setJustLoggedOut] = useState(false); // ✅ New state

	console.log('user', user);

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
		if (justLoggedIn) {
			return; // ✅ Skip auth check immediately after login
		}

		if (justLoggedOut) {
			return; // ✅ Skip auth check immediately after login
		}

		const reachable = await isServerReachable();
		if (!reachable) {
			console.log('Server is unreachable.');
			navigate('/offline');
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
		// Skip `checkAuth` if user **just** logged in and is on /welcome
		if (justLoggedIn && location.pathname === '/welcome') {
			setJustLoggedIn(false); // ✅ Reset flag after first visit
			return;
		}

		if (justLoggedIn && location.pathname === '/') {
			setJustLoggedOut(false); // ✅ Reset flag after first visit
			return;
		}

		if (location.pathname === '/logout' || location.pathname === '/offline') {
			setLoading(false);
			return;
		}

		checkAuth();
	}, [location]);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				setUser,
				checkAuth,
				setJustLoggedIn,
				setJustLoggedOut,
			}}>
			{children}
		</AuthContext.Provider>
	);
}
