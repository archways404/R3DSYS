import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const WeekOverviewComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);
	if (!user) return null;

	// Get the current date
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

	// Adjust so the week starts on Monday (ISO week format)
	const monday = new Date(today);
	monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Move to Monday
	monday.setHours(0, 0, 0, 0);

	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6); // Move to Sunday
	sunday.setHours(23, 59, 59, 999);

	// Filter shifts for the current user within the current week
	const userShifts = shifts.filter((shift) => {
		const shiftStart = new Date(shift.start);
		return (
			shift.extendedProps.assignedUserId === user.uuid &&
			shiftStart >= monday &&
			shiftStart <= sunday
		);
	});

	// Group shifts by day
	const groupedShifts = userShifts.reduce((acc, shift) => {
		const shiftDate = new Date(shift.start);
		const formattedDate = shiftDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD

		if (!acc[formattedDate]) acc[formattedDate] = [];
		acc[formattedDate].push(shift);
		return acc;
	}, {});

	// Sort by date
	const sortedDays = Object.keys(groupedShifts).sort(
		(a, b) => new Date(a) - new Date(b)
	);

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold text-center mb-4">Week Overview</h2>

			<div className="space-y-6">
				{sortedDays.length > 0 ? (
					sortedDays.map((day) => (
						<div
							key={day}
							className="pb-2">
							{/* Date Header */}
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								{new Date(day).toLocaleDateString('en-SE', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</h3>

							{/* Shift List */}
							<div className="space-y-2">
								{groupedShifts[day]
									.sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort by start time
									.map((shift) => {
										const shiftStart = new Date(shift.start);
										const shiftEnd = new Date(shift.end);

										return (
											<div
												key={shift.id}
												className="flex items-center gap-x-6 bg-gray-100 dark:bg-gray-800 p-3 rounded-md shadow">
												<p className="text-gray-900 dark:text-white font-medium">
													{shiftStart.toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}{' '}
													-{' '}
													{shiftEnd.toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
												<p className="text-gray-700 dark:text-gray-300">
													{shift.extendedProps.shiftTypeLong}
												</p>
											</div>
										);
									})}
							</div>
						</div>
					))
				) : (
					<p className="text-gray-500 dark:text-gray-400 text-center">
						No assigned shifts this week.
					</p>
				)}
			</div>
		</div>
	);
};

export default WeekOverviewComponent;
