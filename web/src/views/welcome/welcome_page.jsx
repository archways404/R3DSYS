import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import { RenderContext } from '../../context/RenderContext';

import Layout from '../../components/Layout';
import WeekComponent from './WeekComponent';
import DayOverviewComponent from './DayOverviewComponent';
import TabComponent from './TabComponent';

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
				if (!shift.start) return false; // Ensure start time exists

				// Convert shift start to a UTC-based date
				const shiftDate = new Date(shift.start);
				const shiftYear = shiftDate.getUTCFullYear();
				const shiftMonth = shiftDate.getUTCMonth();
				const shiftDay = shiftDate.getUTCDate();

				// Normalize `renderDay` to local date for comparison
				const selectedDate = new Date(renderDay);
				const selectedYear = selectedDate.getFullYear();
				const selectedMonth = selectedDate.getMonth();
				const selectedDay = selectedDate.getDate();

				return (
					shiftYear === selectedYear &&
					shiftMonth === selectedMonth &&
					shiftDay === selectedDay
				);
		  })
		: [];

	return (
		<Layout>
			{/* FLEX CONTAINER TO ALIGN COMPONENTS SIDE BY SIDE */}
			<div className="flex flex-col md:flex-row w-full gap-6 p-4">
				{/* Left Section (50% width on medium+) */}
				<div className="w-full md:w-[50%]">
					{/* Move Down DayOverviewComponent */}
					<div className="mb-12 mt-12">
						{' '}
						{/* Adds bottom margin to push it down */}
						<DayOverviewComponent shifts={shifts} />
					</div>
					{/* Add margin-top to WeekComponent */}
					<WeekComponent
						onDateSelect={setRenderDay}
						shifts={filteredShifts}
						className="mt-6"
					/>
				</div>

				{/* Right Section (50% width on medium+) */}
				<div className="w-full mt-12 md:w-[50%]">
					<TabComponent shifts={shifts} />
				</div>
			</div>

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
		</Layout>
	);
};

export default Welcome;
