import React, { useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

import { motion } from 'framer-motion';

import {
	Home,
	Settings,
	Bell,
	User,
	Info,
	Send,
	Handshake,
	Cookie,
	GlobeLock,
	Construction,
	ServerCrash,
	ServerOff,
	Rss,
} from 'lucide-react';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

import { GrSchedule } from 'react-icons/gr';
import { TbReport } from 'react-icons/tb';
import { HiTemplate } from 'react-icons/hi';
import { GrSchedules } from 'react-icons/gr';
import { LuMailPlus } from 'react-icons/lu';
import { FaUsers } from 'react-icons/fa';
import { SiGooglecalendar } from 'react-icons/si';
import { FaRegCalendarPlus } from 'react-icons/fa6';
import { GrServerCluster } from 'react-icons/gr';
import { FiDatabase } from 'react-icons/fi';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import { LuCircleUserRound } from 'react-icons/lu';
import { FaChevronUp } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import { BiGroup } from 'react-icons/bi';

import { CgProfile } from 'react-icons/cg';

const Navbar = () => {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const location = useLocation();

	// Determines if the theme is dark
	const isDarkTheme = theme === 'dark';

	// Navbar menu items
	const publicNavLinks = [
		{ title: 'Home', to: '/', icon: Home },
		{ title: 'About', to: '/about', icon: Info },
		{ title: 'Contact', to: '/contact', icon: Send },
		{ title: 'ToS', to: '/tos', icon: Handshake },
		{ title: 'Privacy', to: '/privacy', icon: GlobeLock },
	];

	const dnavLinks = [
		{ title: 'Home', to: '/welcome', icon: Home },
		{ title: 'Schedule', to: '/schedule', icon: GrSchedule },
		{ title: 'My Shifts', to: '/myshifts', icon: GrSchedule, roles: ['worker'] },
		{ title: 'Calendar Link', to: '/calendarlink', icon: SiGooglecalendar },
		{
			title: 'Report',
			to: '/apply-unassigned',
			icon: TbReport,
			roles: ['worker'],
			showBadge: true,
		},
		{
			title: 'Reports',
			to: '/assign-shifts',
			icon: TbReport,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Invite',
			to: '/invite',
			icon: LuMailPlus,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Accounts',
			to: '/manage-users',
			icon: FaUsers,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Groups',
			to: '/handle-groups',
			icon: BiGroup,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'NewSchedule',
			to: '/new-schedule',
			icon: GrSchedule,
			roles: ['admin', 'maintainer', 'worker'],
		},
		{ title: 'Template', to: '/handle-template', icon: HiTemplate, roles: ['admin'] },
		{ title: 'Shifts', to: '/handle-shifts', icon: GrSchedules, roles: ['admin', 'maintainer'] },
		{
			title: 'Requests',
			to: '/requests',
			icon: GrSchedules,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Create',
			to: '/create-schedule',
			icon: FaRegCalendarPlus,
			roles: ['admin'],
		},
		{
			title: 'Server',
			to: '/serverinfo',
			icon: GrServerCluster,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'System',
			to: '/system',
			icon: GrServerCluster,
			roles: ['admin', 'maintainer'],
		},
		{ title: 'Logout', to: '/logout', icon: GrSchedules, roles: ['admin', 'maintainer', 'worker'] },
		{
			title: 'Tables',
			to: '/tables',
			icon: FiDatabase,
			roles: ['admin', 'maintainer'],
		},
		{ title: 'Settings', to: '/settings', icon: Settings },
	];

	/*
	const navLinks = [
		{ title: 'Home', to: '/welcome', icon: Home },
		{
			title: 'Report',
			to: '/apply-unassigned',
			icon: TbReport,
			roles: ['worker'],
			showBadge: true,
		},
		{
			title: 'Reports',
			to: '/assign-shifts',
			icon: TbReport,
			roles: ['admin', 'maintainer'],
		},
		{ title: 'Settings', to: '/settings', icon: Settings },
		{ title: 'Logout', to: '/logout', icon: GrSchedules, roles: ['admin', 'maintainer', 'worker'] },
	];
	*/

	const calendarLinks = [
		{ title: 'Schedule', to: '/schedule', icon: GrSchedule },
		{ title: 'Calendar Link', to: '/calendarlink', icon: SiGooglecalendar },
	];

	const managementLinks = [
		{
			title: 'Invite',
			to: '/invite',
			icon: LuMailPlus,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Accounts',
			to: '/manage-users',
			icon: FaUsers,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Groups',
			to: '/handle-groups',
			icon: BiGroup,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Server',
			to: '/serverinfo',
			icon: GrServerCluster,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'System',
			to: '/system',
			icon: GrServerCluster,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Tables',
			to: '/tables',
			icon: FiDatabase,
			roles: ['admin', 'maintainer'],
		},
	];

	const adminLinks = [
		{ title: 'Template', to: '/handle-template', icon: HiTemplate, roles: ['admin'] },
		{ title: 'Shifts', to: '/handle-shifts', icon: GrSchedules, roles: ['admin', 'maintainer'] },
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

	const gradients = [
		{
			gradient:
				'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
			activeColor: 'text-blue-500',
		},
		{
			gradient:
				'radial-gradient(circle, rgba(249,115,22,0.20) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
			activeColor: 'text-orange-500',
		},
		{
			gradient:
				'radial-gradient(circle, rgba(34,197,94,0.20) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
			activeColor: 'text-green-500',
		},
	];

	const navLinks = [
		{ title: 'Home', to: '/welcome', icon: Home },
		{
			title: 'NewSchedule',
			to: '/new-schedule',
			icon: GrSchedule,
			roles: ['admin', 'maintainer', 'worker'],
		},

		{ title: 'My Shifts', to: '/myshifts', icon: GrSchedule, roles: ['worker'] },

		// Single links
		{
			title: 'Report',
			to: '/apply-unassigned',
			icon: TbReport,
			roles: ['worker'],
			showBadge: true,
		},
		{
			title: 'Reports',
			to: '/assign-shifts',
			icon: TbReport,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Requests',
			to: '/requests',
			icon: GrSchedules,
			roles: ['admin', 'maintainer'],
		},
		{
			title: 'Create',
			to: '/create-schedule',
			icon: FaRegCalendarPlus,
			roles: ['admin'],
		},

		// Grouped Dropdowns (new!)
		{
			title: 'Calendar',
			type: 'group',
			links: calendarLinks,
		},
		{
			title: 'Management',
			type: 'group',
			links: managementLinks,
		},
		{
			title: 'Admin',
			type: 'group',
			links: adminLinks,
		},

		{ title: 'Settings', to: '/settings', icon: Settings },
		{ title: 'Logout', to: '/logout', icon: GrSchedules, roles: ['admin', 'maintainer', 'worker'] },
	];

	const filteredLinks = user
		? navLinks.filter((link) => {
				// Show regular links by role
				if (!link.type && (!link.roles || link.roles.includes(user.role))) return true;

				// Show dropdowns if at least one child link is accessible
				if (link.type === 'group') {
					return link.links.some((sub) => !sub.roles || sub.roles.includes(user.role));
				}

				return false;
		  })
		: publicNavLinks;

	return (
		<motion.nav
			className="fixed top-4 left-1/2 transform -translate-x-1/2 inline-flex gap-4 p-3 rounded-2xl border border-border/40 shadow-lg overflow-visible z-50 bg-transparent backdrop-blur-lg"
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
				{filteredLinks.map((item, i) => {
					const isGroup = item.type === 'group';
					const isActive = location.pathname === item.to;
					const gradientStyle = gradients[i % gradients.length];

					if (isGroup) {
						// Filter child links
						const children = item.links.filter(
							(link) => !link.roles || link.roles.includes(user?.role)
						);

						return (
							<motion.li
								key={item.title}
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
											background: gradientStyle.gradient,
											opacity: 0,
											borderRadius: '16px',
										}}
									/>
									<NavigationMenu>
										<NavigationMenuList>
											<NavigationMenuItem>
												<NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-colors hover:bg-muted/20">
													{item.title}
												</NavigationMenuTrigger>
												<NavigationMenuContent className="p-4 rounded-xl shadow-lg bg-background border border-border min-w-[220px] flex flex-col gap-2">
													{children.map((link) => (
														<Link
															key={link.to}
															to={link.to}
															className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors">
															<link.icon className="w-4 h-4 text-foreground" />
															<span className="text-sm text-foreground">{link.title}</span>
														</Link>
													))}
												</NavigationMenuContent>
											</NavigationMenuItem>
										</NavigationMenuList>
									</NavigationMenu>
								</motion.div>
							</motion.li>
						);
					}

					// Normal item
					return (
						<motion.li
							key={item.title}
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
										background: gradientStyle.gradient,
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
									<span className={isActive ? gradientStyle.activeColor : 'text-white'}>
										<item.icon className="w-5 h-5" />
									</span>
									<span className={isActive ? gradientStyle.activeColor : 'text-white'}>
										{item.title}
									</span>
									{item.showBadge && <span className="ml-2 text-xs text-green-500">NEW</span>}
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
