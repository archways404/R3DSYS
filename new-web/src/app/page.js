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

	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	useEffect(() => {
		const protectedRoutes = ['/dashboard', '/settings'];
		const adminOnlyRoutes = ['/settings'];

		if (!user && protectedRoutes.includes(pathname)) {
			router.push('/login');
		}

		if (user && adminOnlyRoutes.includes(pathname) && user.role !== 'admin') {
			router.push('/dashboard');
		}
	}, [pathname, user]);

	switch (pathname) {
		case '/login':
			return <Login />;
		case '/dashboard':
			return user ? <Dashboard /> : null;
		case '/settings':
			if (!hydrated) return null;
			if (!user) return null;
			if (user.role !== 'admin') return null;
			return <Settings />;
		case '/':
			return <Login />;
		default:
			return <NotFound />;
	}
}
