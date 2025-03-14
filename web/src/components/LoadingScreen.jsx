import React from 'react';
import { Mosaic } from 'react-loading-indicators';

const rainbowColors = ['#FF0000', '#00FF00', '#0000FF'];

const LoadingScreen = ({ isVisible }) => {
	if (!isVisible) return null; // If not visible, return nothing

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-[999]">
			<Mosaic
				color={rainbowColors}
				size="large"
				duration={1000}
			/>
		</div>
	);
};

export default LoadingScreen;
