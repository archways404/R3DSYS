import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import LoadingScreen from './LoadingScreen';

const AuthWrapper = ({ children, allowedUserRoles }) => {
	const { user, loading } = useContext(AuthContext);
	const [showLoading, setShowLoading] = useState(true);

	useEffect(() => {
		const minLoadingTime = 500; // Minimum time to show loading (in ms)
		const timeout = setTimeout(() => {
			setShowLoading(false);
		}, minLoadingTime);

		return () => clearTimeout(timeout); // Cleanup on unmount
	}, []);

	// Ensure loading screen is displayed for at least 0.5s
	if (loading || showLoading) {
		return <LoadingScreen />;
	}

	// Redirect to login if user is not authenticated
	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	// Redirect if user role is not allowed
	if (allowedUserRoles && !allowedUserRoles.includes(user.role)) {
		return (
			<Navigate
				to="/welcome"
				replace
			/>
		);
	}

	return children;
};

export default AuthWrapper;
