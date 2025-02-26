import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function Logout() {
	const navigate = useNavigate();
	const { setUser } = useContext(AuthContext);
	const [isLoggingOut, setIsLoggingOut] = useState(true);

	useEffect(() => {
		const logoutUser = async () => {
			const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 500)); // Ensure 500ms min delay
			const logoutRequest = axios.post(
				import.meta.env.VITE_BASE_ADDR + '/logout',
				{},
				{ withCredentials: true }
			);

			try {
				await Promise.all([logoutRequest, minLoadingTime]); // Wait for both to complete
				setUser(null);
				navigate('/');
			} catch (error) {
				console.error('Error logging out:', error);
				setUser(null);
				navigate('/error');
			} finally {
				setIsLoggingOut(false);
			}
		};

		logoutUser();
	}, [navigate, setUser]);

	// Ensure smooth transition (at least 500ms)
	if (isLoggingOut) {
		return <LoadingScreen />;
	}

	return null;
}

export default Logout;
