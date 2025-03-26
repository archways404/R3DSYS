import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [justLoggedIn, setJustLoggedIn] = useState(false);
	const [justLoggedOut, setJustLoggedOut] = useState(false);
	const [lastActivity, setLastActivity] = useState(Date.now());

	const location = useLocation();
	const navigate = useNavigate();
	const activityTimeoutRef = useRef(null);

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
			setJustLoggedOut(false);
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

	// ✅ Function to check if the session is about to expire and refresh it
	const refreshSessionIfNeeded = async () => {
		if (!user || !user.exp) return;

		const now = Math.floor(Date.now() / 1000);
		const expiresIn = user.exp - now; // Time left in seconds

		// If the cookie is about to expire within 2 minutes AND user is active, renew session
		if (expiresIn < 120 && Date.now() - lastActivity < 300000) {
			// User has been active in the last 5 minutes (300000ms)
			console.log('Refreshing session...');
			await checkAuth(); // This will renew the session if possible
		}
	};

	// ✅ Function to handle user activity (Mouse/Keyboard)
	const handleUserActivity = () => {
		setLastActivity(Date.now()); // Update last activity timestamp
		clearTimeout(activityTimeoutRef.current); // Reset inactivity timeout
		activityTimeoutRef.current = setTimeout(refreshSessionIfNeeded, 60000); // Check every minute
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

	// ✅ Listen for user activity (Mouse/Keyboard) and refresh session
	useEffect(() => {
		window.addEventListener('mousemove', handleUserActivity);
		window.addEventListener('keydown', handleUserActivity);
		const interval = setInterval(refreshSessionIfNeeded, 60000); // Check every 1 minute

		return () => {
			window.removeEventListener('mousemove', handleUserActivity);
			window.removeEventListener('keydown', handleUserActivity);
			clearInterval(interval);
		};
	}, [user, lastActivity]);

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
