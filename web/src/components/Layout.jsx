import React, { useContext, useState, useEffect, createContext } from 'react';
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
import Footer from './Footer';
import Background from './Background';
import LoadingScreen from './LoadingScreen';

export const VersionContext = createContext();

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const { renderLoading } = useStateContext();

	// ✅ Get stored version from localStorage
	const storedVersion = localStorage.getItem('app_version');
	const [version, setVersion] = useState(storedVersion);
	const [loading, setLoading] = useState(storedVersion === null);

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/version`
				);
				const data = await response.json();

				if (response.ok) {
					// ✅ Only update if the fetched version is different
					if (data.version !== storedVersion) {
						setVersion(data.version);
						localStorage.setItem('app_version', data.version);
					}
				}
			} catch (error) {
				console.error('Error fetching version information:', error);
			} finally {
				// ✅ Mark loading false only if no version was stored initially
				if (storedVersion === null) {
					setLoading(false);
				}
			}
		};

		// ✅ Always fetch, but don't show loading if a stored version exists
		fetchVersion();
	}, []); // ✅ Run only once on mount

	return (
		<VersionContext.Provider value={{ version, loading }}>
			<div className="relative flex flex-col min-h-screen">
				{/* Background Component */}
				<Background />

				{/* Global Loading Screen with Smooth Transition */}
				<LoadingScreen isVisible={renderLoading} />

				{user ? (
					<div className="flex flex-col flex-1 min-h-screen relative">
						{/* Main Content */}
						<div className="flex flex-col flex-1 relative z-10">
							{/* Navbar */}
							<div className="min-h-[4rem] flex items-center overflow-visible relative z-50">
								<Navbar />
							</div>

							{/* Main Content */}
							<main className="flex-1 overflow-auto">{children}</main>
						</div>

						{/* Other Global Components */}
						<Toaster />
					</div>
				) : (
					<div className="flex flex-col flex-1 min-h-screen relative">
						<Navbar />
						<main className="flex-1">{children}</main>
						<Toaster />
					</div>
				)}
			</div>
		</VersionContext.Provider>
	);
}

export default Layout;
