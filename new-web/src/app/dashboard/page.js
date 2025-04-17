// src/routes/dashboard.jsx
'use client';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '@/store/slices/authSlice';

export default function Dashboard() {
	const user = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();

	return (
		<div>
			<h1>Dashboard</h1>
			{user ? (
				<>
					<p>Welcome {user.name}</p>
					<button onClick={() => dispatch(logout())}>Logout</button>
				</>
			) : (
				<>
					<p>You are not logged in</p>
					<button onClick={() => dispatch(login({ name: 'John Doe' }))}>Login</button>
				</>
			)}
		</div>
	);
}
