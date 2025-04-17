'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const dispatch = useDispatch();
	const user = useSelector((state) => state.auth.user);
	const showSettings = 'true';

	const currentPage =
		{
			'/': 'Home',
			'/login': 'Login',
			'/dashboard': 'Dashboard',
			'/settings': 'Settings',
		}[pathname] || 'Unknown';

	const handleLogout = () => {
		dispatch(logout());
		router.push('/login');
	};

	return (
		<nav className="p-4 bg-gray-100 flex flex-wrap items-center gap-4">
			<span className="text-sm font-medium text-blue-600">📍 {currentPage}</span>

			<div className="flex gap-4">
				<Link
					href="/dashboard"
					className={pathname === '/dashboard' ? 'font-bold' : ''}>
					Dashboard
				</Link>

				{user ? (
					<>
						{user.role === 'admin' && showSettings && (
							<Link
								href="/settings"
								className={pathname === '/settings' ? 'font-bold' : ''}>
								Settings
							</Link>
						)}
						<button
							onClick={handleLogout}
							className="text-red-600 hover:underline">
							Logout
						</button>
					</>
				) : (
					<Link
						href="/login"
						className={pathname === '/login' ? 'font-bold' : ''}>
						Login
					</Link>
				)}
			</div>

			{user && (
				<span className="ml-auto text-sm text-gray-600">
					Logged in as{' '}
					<strong>
						{user.name} {user.role}
					</strong>
				</span>
			)}
		</nav>
	);
}
