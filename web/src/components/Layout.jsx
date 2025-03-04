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

// ✅ Create a Version Context
export const VersionContext = createContext();

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const { renderLoading } = useStateContext();

	// ✅ Get stored version from localStorage
	const storedVersion = localStorage.getItem('app_version');
	const [version, setVersion] = useState(storedVersion);
	const [loading, setLoading] = useState(storedVersion === null); // ✅ Only show loading if no stored version

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
				<Footer />
			</div>
		</VersionContext.Provider>
	);
}

export default Layout;
