import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const WeekOverviewComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);
	if (!user) return null;

	// Filter shifts to only show those assigned to the current user
	const userShifts = shifts.filter(
		(shift) => shift.assigned_user_id === user.uuid
	);

	// Group shifts by day
	const groupedShifts = userShifts.reduce((acc, shift) => {
		const shiftDate = new Date(shift.date);
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
							className="border-b border-gray-400 pb-2">
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
									.sort((a, b) => a.start_time.localeCompare(b.start_time)) // Sort shifts by start time
									.map((shift) => {
										// ✅ Ensure `shift.date` is treated as a **local date**
										const shiftDateLocal = new Date(shift.date);
										shiftDateLocal.setHours(0, 0, 0, 0); // Normalize time

										// ✅ Construct full timestamps using `shiftDateLocal`
										const shiftStart = new Date(
											shiftDateLocal.getFullYear(),
											shiftDateLocal.getMonth(),
											shiftDateLocal.getDate(),
											...shift.start_time.split(':').map(Number) // Parse HH:MM
										);

										const shiftEnd = new Date(
											shiftDateLocal.getFullYear(),
											shiftDateLocal.getMonth(),
											shiftDateLocal.getDate(),
											...shift.end_time.split(':').map(Number) // Parse HH:MM
										);

										// ✅ Ensure valid formatting
										const formattedStart = isNaN(shiftStart.getTime())
											? 'Invalid Time'
											: shiftStart.toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
											  });

										const formattedEnd = isNaN(shiftEnd.getTime())
											? 'Invalid Time'
											: shiftEnd.toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
											  });

										return (
											<div
												key={shift.shift_id}
												className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-md shadow">
												<p className="text-gray-900 dark:text-white font-medium">
													{formattedStart} - {formattedEnd}
												</p>
												<p className="text-gray-700 dark:text-gray-300">
													{shift.shift_type_long}
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
