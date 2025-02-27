import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import LoadingScreen from './LoadingScreen';

const AuthWrapper = ({ children, allowedUserRoles }) => {
	const { user, loading } = useContext(AuthContext);

	// If still loading, show loading screen
	if (loading) {
		return;
	}

	// If user is not logged in, send them to login

	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	// If user role isn't allowed, send them to /welcome
	if (allowedUserRoles && !allowedUserRoles.includes(user.role)) {
		return (
			<Navigate
				to="/welcome"
				replace
			/>
		);
	}

	// Otherwise, render the page
	return children;
};

export default AuthWrapper;
