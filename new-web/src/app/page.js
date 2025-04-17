'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Login from './login/page';
import Dashboard from './dashboard/page';
import Settings from './settings/page';
import NotFound from './not-found/page';
import { useSelector } from 'react-redux';

export default function Page() {
	const { slug } = useParams();
	const pathname = `/${slug?.join('/') || ''}`;
	const router = useRouter();
	const user = useSelector((state) => state.auth.user);

	useEffect(() => {
		const protectedRoutes = ['/dashboard', '/settings'];
		if (!user && protectedRoutes.includes(pathname)) {
			router.push('/login');
		}
	}, [pathname, user]);

	switch (pathname) {
		case '/login':
			return <Login />;
		case '/dashboard':
			return user ? <Dashboard /> : null;
		case '/settings':
			return user ? <Settings /> : null;
		case '/':
			return <Login />;
		default:
			return <NotFound />;
	}
}
