import React, { useContext, useState, useEffect } from 'react';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import DisplayStatus from './DisplayStatus';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext';
import { useStateContext } from '../context/RenderContext';

import { AppSidebar } from '@/components/appsidebar';

import Background from './Background';
import LoadingScreen from './LoadingScreen';
import VersionComponent from './VersionComponent'; 

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const { renderLoading } = useStateContext();

	return (
		<div className="relative h-screen w-full">
			{/* Background Component */}
			<Background />

			{/* Global Loading Screen with Smooth Transition */}
			<LoadingScreen isVisible={renderLoading} />

			{/* Main Content */}
			{user ? (
				<div className="grid grid-cols-[15rem_auto] gap-2 relative h-screen">
					{/* Sidebar */}
					<div className="w-60 relative z-10">
						<AppSidebar
							user={user}
							consent={consent}
						/>
					</div>

					{/* Main Content */}
					<div className="flex flex-col flex-1 min-h-screen relative z-10">
						{/* Navbar */}
						<div className="h-16 flex items-center">{/*<Navbar />*/}</div>

						{/* Scrollable Main Content */}
						<main className="flex-1 overflow-auto">{children}</main>
					</div>

					{/* Other Global Components */}
					<Toaster />
				</div>
			) : (
				<div className="h-screen relative z-10">
					<div className="flex flex-col flex-1 min-h-screen">
						<div className="h-16 w-full flex items-center">
							<Navbar />
						</div>
						<main className="flex-1 overflow-auto">{children}</main>
					</div>
					<Toaster />
				</div>
			)}
		</div>
	);
}

export default Layout;


//09090b
