import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const renderLinksForUserRole = () => {
		switch (user.role) {
			case 'worker':
				return (
					<>
						<li>
							<Link
								to="/schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Schedule
							</Link>
						</li>
						<li>
							<Link
								to="/apply-unassigned"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								unassigned
							</Link>
						</li>
						<li>
							<Link
								to="/calendarlink"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								iCAL
							</Link>
						</li>
					</>
				);
			case 'admin':
				return (
					<>
						<li>
							<Link
								to="/create-template"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								templates
							</Link>
						</li>
						<li>
							<Link
								to="/handle-template"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								templ
							</Link>
						</li>
						<li>
							<Link
								to="/handle-shifts"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								shifts
							</Link>
						</li>
						<li>
							<Link
								to="/apply-unassigned"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								unassigned
							</Link>
						</li>
						<li>
							<Link
								to="/assign-shifts"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								assign
							</Link>
						</li>
						<li>
							<Link
								to="/invite"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								invitation
							</Link>
						</li>
						<li>
							<Link
								to="/calendarlink"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								iCAL
							</Link>
						</li>
						<li>
							<Link
								to="/manage-users"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								users
							</Link>
						</li>
						<li>
							<Link
								to="/handle-status"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								status
							</Link>
						</li>
						<li>
							<Link
								to="/schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								schedule
							</Link>
						</li>
						<li>
							<Link
								to="/create-schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								create-schedule
							</Link>
						</li>
						<li>
							<Link
								to="/serverinfo"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								s-info
							</Link>
						</li>
						<li>
							<Link
								to="/server-panel"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								d-panel
							</Link>
						</li>
						<li>
							<Link
								to="/email-status"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								email-status
							</Link>
						</li>
					</>
				);
			case 'maintainer':
				return (
					<>
						<li>
							<Link
								to="/dashboard"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Dashboard
							</Link>
						</li>
						<li>
							<Link
								to="/server-panel"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Server-Panel
							</Link>
						</li>
						<li>
							<Link
								to="/email-status"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Email-Status
							</Link>
						</li>
					</>
				);
		}
	};

	return (
		<nav className={`p-4 w-full`}>
			<ul className="flex w-full justify-between px-5">
				<li>
					<Link
						to="/welcome"
						className={`${
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Home
					</Link>
				</li>
				<li>
					<Link
						to="/settings"
						className={`${
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Settings
					</Link>
				</li>

				{/* Conditionally render links based on user Role */}
				{renderLinksForUserRole()}

				<li>
					<Link
						to="/logout"
						className={`${
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Logout
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
