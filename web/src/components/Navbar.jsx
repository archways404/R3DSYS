import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

import { motion } from 'framer-motion';
import { Home, Settings, Bell, User } from 'lucide-react';

const Navbar = () => {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const location = useLocation();

	// Determines if the theme is dark
	const isDarkTheme = theme === 'dark';

	// Navbar menu items
	const menuItems = [
		{
			icon: <Home className="h-5 w-5" />,
			label: 'Home',
			to: '/',
			gradient:
				'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
			activeColor: 'text-blue-500',
		},
		{
			icon: <Bell className="h-5 w-5" />,
			label: 'Notifications',
			to: '/notifications',
			gradient:
				'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
			activeColor: 'text-orange-500',
		},
		{
			icon: <Settings className="h-5 w-5" />,
			label: 'Settings',
			to: '/settings',
			gradient:
				'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
			activeColor: 'text-green-500',
		},
		{
			icon: <User className="h-5 w-5" />,
			label: 'Profile',
			to: '/profile',
			gradient:
				'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)',
			activeColor: 'text-red-500',
		},
	];

	const glowVariants = {
		initial: { opacity: 0, scale: 0.8 },
		hover: {
			opacity: 1,
			scale: 2,
			transition: {
				opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
				scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
			},
		},
	};

	const navGlowVariants = {
		initial: { opacity: 0 },
		hover: {
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: [0.4, 0, 0.2, 1],
			},
		},
	};

	return (
		<motion.nav
			className="fixed top-4 left-1/2 transform -translate-x-1/2 inline-flex gap-4 p-3 rounded-2xl bg-transparent border border-border/40 shadow-lg overflow-hidden z-50"
			initial="initial"
			whileHover="hover">
			<motion.div
				className={`absolute -inset-2 bg-gradient-radial from-transparent ${
					isDarkTheme
						? 'via-blue-400/30 via-30% via-purple-400/30 via-60% via-red-400/30 via-90%'
						: 'via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90%'
				} to-transparent rounded-3xl z-0 pointer-events-none`}
				variants={navGlowVariants}
			/>
			<ul className="flex items-center gap-4 relative z-10">
				{menuItems.map((item) => {
					const isActive = location.pathname === item.to;
					return (
						<motion.li
							key={item.label}
							className="relative">
							<motion.div
								className="block rounded-xl overflow-visible group relative"
								style={{ perspective: '600px' }}
								whileHover="hover"
								initial="initial">
								<motion.div
									className="absolute inset-0 z-0 pointer-events-none"
									variants={glowVariants}
									style={{
										background: item.gradient,
										opacity: 0,
										borderRadius: '16px',
									}}
								/>
								<Link
									to={item.to}
									style={{
										transformStyle: 'preserve-3d',
										transformOrigin: 'center bottom',
									}}
									className="flex items-center gap-2 px-4 py-2 relative z-10 transition-colors rounded-xl">
									<span
										className={`transition-colors duration-300 ${
											isActive ? item.activeColor : 'text-white'
										}`}>
										{item.icon}
									</span>
									<span
										className={`transition-colors duration-300 ${
											isActive ? item.activeColor : 'text-white'
										}`}>
										{item.label}
									</span>
								</Link>
							</motion.div>
						</motion.li>
					);
				})}
			</ul>
		</motion.nav>
	);
};

export default Navbar;
