import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import { RenderContext } from '../../context/RenderContext';

import Layout from '../../components/Layout';
import WeekComponent from './WeekComponent';
import WeekOverviewComponent from './WeekOverviewComponent';

const Welcome = () => {
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const { setRenderLoading } = useContext(RenderContext);

	const [renderDay, setRenderDay] = useState(null);
	const [shifts, setShifts] = useState([]);
	const [error, setError] = useState(null);

	console.log('user', user);
	console.log('shifts', shifts);
	console.log('Selected Render Day:', renderDay);

	if (!user) {
		return null;
	}

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

	useEffect(() => {
		//setRenderLoading(false); // ✅ Now it updates AFTER render
	}, []);

	// Fetch active shifts for the user
	useEffect(() => {
		const fetchShifts = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getActiveShiftsForUser`,
					{
						method: 'GET',
						credentials: 'include', // ✅ Ensures cookies are sent
					}
				);

				if (!response.ok) {
					throw new Error(`Error fetching shifts: ${response.statusText}`);
				}

				const data = await response.json();
				console.log('data', data);
				setShifts(data); // Store shifts in state
			} catch (err) {
				setError(err.message);
			} finally {
				setRenderLoading(false); // ✅ Now it updates AFTER render
			}
		};

		fetchShifts();
	}, []);

	useEffect(() => {
		setRenderDay(new Date()); // Set today's date after mounting
	}, []);

	const filteredShifts = renderDay
		? shifts.filter((shift) => {
				if (!shift.date) return false; // Ensure date exists

				// Ensure the shift date is interpreted as local time
				const shiftDate = new Date(shift.date);
				shiftDate.setHours(0, 0, 0, 0); // Normalize time

				// Ensure `renderDay` only contains the date part
				const selectedDate = new Date(renderDay);
				selectedDate.setHours(0, 0, 0, 0); // Normalize time

				return shiftDate.getTime() === selectedDate.getTime(); // Compare exact day
		  })
		: [];

	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="max-w-md w-full rounded-lg p-6 space-y-4">
					<h1 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
						Welcome, {formattedFirstName} {formattedLastName}.
					</h1>
					<div className="text-gray-600 dark:text-gray-300 text-sm">
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								UUID:
							</span>{' '}
							{user.uuid}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Email:
							</span>{' '}
							{user.email}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Role:
							</span>{' '}
							{user.role}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Groups:
							</span>{' '}
							{user.groups && user.groups.length > 0
								? user.groups.map((group, index) => (
										<span key={group.id}>
											{group.name}
											{index < user.groups.length - 1 ? ', ' : ''}{' '}
											{/* Add comma between items */}
										</span>
								  ))
								: 'No groups'}
						</p>
						<br></br>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Permissions:
							</span>
						</p>
						{/* Render permissions on separate lines */}
						{Object.entries(permissionsObject).map(([key, value]) => (
							<p
								key={key}
								className="text-gray-800 dark:text-white mt-2">
								{key}: {value ? '✅' : '❌'}
							</p>
						))}
					</div>
				</div>
			</div>

			{/* FLEX CONTAINER TO ALIGN COMPONENTS SIDE BY SIDE */}
			<div className="flex w-full gap-4 p-4">
				{/* WeekComponent takes 30% width */}
				<div className="w-3/10">
					<WeekComponent
						onDateSelect={setRenderDay}
						shifts={filteredShifts}
					/>
				</div>

				{/* WeekOverviewComponent takes 70% width */}
				<div className="w-7/10">
					<WeekOverviewComponent shifts={shifts} />
				</div>
			</div>
		</Layout>
	);
};

export default Welcome;
