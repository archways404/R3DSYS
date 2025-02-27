import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const UnAuthWrapper = ({ children }) => {
	const { user } = useContext(AuthContext);

	// If user is logged in, redirect them to "/welcome"
	if (user) {
		return (
			<Navigate
				to="/welcome"
				replace
			/>
		);
	}

	// Otherwise, render the page immediately
	return children;
};

export default UnAuthWrapper;
