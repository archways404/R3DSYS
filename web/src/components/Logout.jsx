import React, { useEffect, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function Logout() {
	const { setUser } = useContext(AuthContext);
	const [logoutCompleted, setLogoutCompleted] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		const logoutUser = async () => {
			try {
				await axios.post(
					import.meta.env.VITE_BASE_ADDR + '/logout',
					{},
					{ withCredentials: true }
				);
				setUser(null);
				setLogoutCompleted(true);
			} catch (error) {
				console.error('Error logging out:', error);
				setUser(null);
				setError(true);
			}
		};

		logoutUser();
	}, [setUser]);

	// Redirect to error page if logout fails
	if (error) {
		return (
			<Navigate
				to="/error"
				replace
			/>
		);
	}

	// Redirect to home after logout
	if (logoutCompleted) {
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	}

	// Render nothing while waiting for logout to complete
	return null;
}

export default Logout;
