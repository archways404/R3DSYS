import React from 'react';
import { Button } from '@/components/ui/button'; // ShadCN button component

const WeekComponent = ({ onDateSelect, shifts }) => {
	const today = new Date();
	const currentDayIndex = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

	// Adjust the week to start on Monday
	const daysOfWeek = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	];

	// Get the start of the current week (Monday)
	const startOfWeek = new Date(today);
	startOfWeek.setDate(
		today.getDate() - ((currentDayIndex === 0 ? 7 : currentDayIndex) - 1)
	);

	// Get the month name
	const monthName = startOfWeek.toLocaleString('default', { month: 'long' });

	return (
		<div className="p-6 bg-transparent text-white rounded-lg shadow-md">
			{/* Month Header */}
			<h2 className="text-2xl font-bold text-center mb-6 uppercase tracking-wider">
				{monthName}
			</h2>

			{/* Weekday Names & Buttons (Stacked) */}
			<div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-400">
				{daysOfWeek.map((dayName, index) => (
					<div
						key={index}
						className="flex flex-col items-center">
						{/* Day Name (Above) */}
						<span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
							{dayName.substring(0, 3)}{' '}
							{/* Show only first 3 letters (Mon, Tue, etc.) */}
						</span>

						{/* Week Button (Below) */}
						<Button
							onClick={() =>
								onDateSelect(
									new Date(
										startOfWeek.getFullYear(),
										startOfWeek.getMonth(),
										startOfWeek.getDate() + index
									)
								)
							}
							className={`w-12 h-12 flex items-center justify-center text-base font-bold rounded-full transition-all
						bg-gray-800 border border-gray-600 
						${
							new Date(
								startOfWeek.getFullYear(),
								startOfWeek.getMonth(),
								startOfWeek.getDate() + index
							) < new Date().setHours(0, 0, 0, 0)
								? 'border-gray-700 text-gray-500'
								: 'border-gray-400 text-white'
						}
						${
							new Date(
								startOfWeek.getFullYear(),
								startOfWeek.getMonth(),
								startOfWeek.getDate() + index
							).toDateString() === new Date().toDateString()
								? 'border-yellow-500 text-yellow-400 bg-yellow-900'
								: ''
						}
						hover:border-red-500 hover:text-red-400 hover:bg-gray-700
						focus:border-red-600 focus:text-red-500 active:scale-95
					`}>
							{new Date(
								startOfWeek.getFullYear(),
								startOfWeek.getMonth(),
								startOfWeek.getDate() + index
							).getDate()}
						</Button>
					</div>
				))}
			</div>

			{/* Shift Cards Below Buttons */}
			<div className="mt-8 space-y-1 w-full">
				{shifts.length > 0 ? (
					<div className="grid w-full gap-y-1">
						{[...shifts]
							.sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort by start time
							.map((shift) => {
								// Ensure `start` and `end` are parsed correctly
								const shiftStart = new Date(shift.start);
								const shiftEnd = new Date(shift.end);

								// 🔹 Check if shift has ended
								const isPastShift = shiftEnd < new Date();

								// 🔹 Format assigned user's name (FirstName LastInitial)
								const assignedUser = shift.extendedProps.assignedUserFirstName
									? `${
											shift.extendedProps.assignedUserFirstName
									  } ${shift.extendedProps.assignedUserLastName.charAt(0)}`
									: 'Unassigned';

								return (
									<div
										key={shift.id}
										className="grid grid-cols-[150px_1fr_200px] w-full items-center px-4 py-2 border-b border-gray-300 dark:border-gray-700">
										{/* Time */}
										<p
											className={`text-lg font-semibold ${
												isPastShift
													? 'text-gray-500 dark:text-gray-400'
													: 'text-blue-500 dark:text-blue-400'
											}`}>
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

										{/* Shift Title */}
										<p
											className={`text-lg font-bold ${
												isPastShift
													? 'text-gray-500 dark:text-gray-400'
													: 'text-gray-900 dark:text-white'
											}`}>
											{shift.extendedProps.shiftTypeLong}
										</p>

										{/* Assigned User */}
										{assignedUser !== 'Unassigned' && (
											<p
												className={`text-lg text-right ${
													isPastShift
														? 'text-gray-500 dark:text-gray-400'
														: 'text-green-500 dark:text-green-400'
												}`}>
												{assignedUser}
											</p>
										)}
									</div>
								);
							})}
					</div>
				) : (
					<p className="text-lg text-gray-500 dark:text-gray-400 text-left px-4">
						No shifts scheduled for this day.
					</p>
				)}
			</div>
		</div>
	);
};

export default WeekComponent;
