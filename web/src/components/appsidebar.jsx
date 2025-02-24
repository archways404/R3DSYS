import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MdOutlinePrivacyTip } from 'react-icons/md';

import { LuCircleUserRound } from 'react-icons/lu';
import { FaChevronUp } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';

import { CgProfile } from 'react-icons/cg';

//import UserIcon from '../assets/user.png'; // Import the image
import UserIcon from '../assets/user1.png'; // Import the image

import ThemeToggle from './ThemeToggle';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarFooter,
	SidebarMenuBadge,
} from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Link, useLocation } from 'react-router-dom';

import { GrSchedule } from 'react-icons/gr';
import { TbReport } from 'react-icons/tb';
import { HiTemplate } from 'react-icons/hi';
import { GrSchedules } from 'react-icons/gr';
import { LuMailPlus } from 'react-icons/lu';
import { FaUsers } from 'react-icons/fa';
import { FaRegCalendarPlus } from 'react-icons/fa6';
import { GrServerCluster } from 'react-icons/gr';

// Sidebar menu items
const items = [
	{ title: 'Home', url: '/welcome', icon: Home }, // Everyone
	{ title: 'Schedule', url: '/schedule', icon: GrSchedule }, // Everyone
	{
		title: 'Report',
		url: '/apply-unassigned',
		icon: TbReport,
		roles: ['worker'],
		disabled: true,
		showBadge: false,
	},
	{
		title: 'Template',
		url: '/handle-template',
		icon: HiTemplate,
		roles: ['admin'],
	},
	{
		title: 'Shifts',
		url: '/handle-shifts',
		icon: GrSchedules,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Reports',
		url: '/assign-shifts',
		icon: TbReport,
		roles: ['admin'],
	},
	{
		title: 'Invite',
		url: '/invite',
		icon: LuMailPlus,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Accounts',
		url: '/manage-users',
		icon: FaUsers,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Create',
		url: '/create-schedule',
		icon: FaRegCalendarPlus,
		roles: ['admin'],
	},
	{
		title: 'Server',
		url: '/serverinfo',
		icon: GrServerCluster,
		roles: ['admin', 'maintainer'],
	},
	{ title: 'Settings', url: '/settings', icon: Settings }, // Everyone
];

export function AppSidebar({ user, consent }) {
	if (!user) {
		return null;
	}

	const location = useLocation();

	// Format the user's name
	const formattedFirstName =
		user.first.charAt(0).toUpperCase() + user.first.slice(1);
	const formattedLastName = user.last.charAt(0).toUpperCase();

	// Define all possible categories
	const allCategories = ['necessary', 'preferences', 'analytics'];

	// Use optional chaining with a fallback to false
	const permissionsObject = allCategories.reduce((acc, category) => {
		acc[category] = consent?.acceptedCategories?.includes(category) ?? false;
		return acc;
	}, {});

	// Filter the menu items based on the user's role
	const filteredItems = items.filter((item) => {
		return !item.roles || item.roles.includes(user.role);
	});

	console.log('permissions obj', permissionsObject);

	return (
		<SidebarProvider open={true}>
			{/* Fixed Sidebar */}
			<div className="w-60 h-screen fixed top-0 left-0 flex flex-col shadow-lg">
				{/* Sidebar Component */}
				<Sidebar
					collapsible="none"
					side="left"
					className="h-full bg-transparent">
					<SidebarContent className="h-full flex flex-col">
						<SidebarGroup className="flex-1">
							{/* Centering the RƎDSYS logo */}
							<SidebarGroupLabel className="mt-6 mb-6 flex justify-center">
								<h1 className="text-3xl lg:text-3xl font-extrabold text-white tracking-wider drop-shadow-xl text-center">
									<span className="text-red-600">RƎD</span>SYS
								</h1>
							</SidebarGroupLabel>

							{/* Sidebar Items */}
							<SidebarGroupContent className="space-y-6">
								<SidebarMenu>
									{filteredItems.map((item) => {
										const isActive = location.pathname === item.url;

										return (
											<SidebarMenuItem key={item.title}>
												{item.disabled ? (
													// Disabled Item (No Link)
													<div className="flex items-center gap-3 p-2 rounded-md transition-all opacity-50 cursor-not-allowed">
														<item.icon className="w-5 h-5 text-gray-500" />
														<span>{item.title}</span>
													</div>
												) : (
													// Active Item (Clickable Link)
													<SidebarMenuButton asChild>
														<Link
															to={item.url}
															className={`flex items-center gap-3 p-2 rounded-md transition-all ${
																isActive ? 'text-red-500' : 'text-white'
															} hover:bg-gray-800`}>
															<item.icon
																className={`w-5 h-5 ${
																	isActive ? 'text-red-500' : 'text-white'
																}`}
															/>
															<span>{item.title}</span>

															{/* Show "NEW" badge only if item has showBadge=true and is not disabled */}
															{!item.disabled && item.showBadge && (
																<SidebarMenuBadge>
																	<Badge
																		variant="outline"
																		className="border-green-500 text-green-500 text-[10px] font-light px-1.5 py-0.5 h-auto rounded-xl">
																		NEW
																	</Badge>
																</SidebarMenuBadge>
															)}
														</Link>
													</SidebarMenuButton>
												)}
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					{/* Sidebar Footer */}
					<SidebarFooter className="p-4">
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<div className="grid grid-cols-2 gap-4 p-6">
										{/* Theme Toggle */}
										<div className="flex justify-center">
											<ThemeToggle className="p-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all w-full max-w-[120px]" />
										</div>

										{/* Cookie Preferences Button */}
										<div className="flex justify-center">
											<Button
												type="button"
												className="px-2 py-2 bg-transparent rounded-lg hover:bg-gray-700 transition-all"
												onClick={() => window.CookieConsent?.showPreferences()}>
												<MdOutlinePrivacyTip
													className="text-white"
													style={{
														width: '24px',
														height: '24px',
														color: 'red',
													}}
												/>
											</Button>
										</div>
									</div>
									<DropdownMenuTrigger asChild>
										{/* Profile Button */}
										<Button
											variant="ghost"
											className="w-full flex items-center px-4 py-6 rounded-lg bg-transparent border-2 border-gray-700 hover:bg-gray-700 transition-all">
											<div className="flex items-center gap-3 flex-1 min-w-0">
												{/* Avatar */}
												<img
													src={UserIcon}
													alt="User Avatar"
													className="w-8 h-8 rounded-full object-cover"
												/>
												{/* User Info */}
												<div className="text-left flex-1 min-w-0">
													<p className="text-[clamp(12px, 4vw, 16px)] font-medium text-white truncate">
														{formattedFirstName} {formattedLastName}
													</p>
													<p className="text-[clamp(10px, 3vw, 14px)] text-gray-400 truncate">
														{user.email}
													</p>
												</div>
											</div>

											{/* Chevron (Prevent Overflow) */}
											<FaChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
										</Button>
									</DropdownMenuTrigger>

									{/* Dropdown Content */}
									<DropdownMenuContent className="w-56 bg-transparent rounded-lg">
										<DropdownMenuItem className="p-2 hover:bg-gray-700 rounded-lg flex gap-3 items-center text-red-400">
											<TbLogout className="w-4 h-4" />
											<Link to="/logout">Sign out</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>
			</div>
		</SidebarProvider>
	);
}
