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
		<div className="p-4">
			{/* Month Header */}
			<h2 className="text-xl font-bold text-center mb-4">{monthName}</h2>

			{/* Week Buttons */}
			<div className="grid grid-cols-7 gap-4">
				{daysOfWeek.map((dayName, index) => {
					// Calculate the date for each day of the week
					const dayDate = new Date(startOfWeek);
					dayDate.setDate(startOfWeek.getDate() + index);

					// Determine if the day is past, current, or future
					const isPast = dayDate < new Date().setHours(0, 0, 0, 0); // Compare without time
					const isCurrent = dayDate.toDateString() === today.toDateString();

					return (
						<Button
							key={index}
							onClick={() => onDateSelect(dayDate)}
							className={`
								w-full h-16 flex flex-col justify-center items-center text-xl font-bold rounded-lg transition-all
								bg-transparent hover:bg-transparent border-2
								${isPast ? 'border-gray-700 text-gray-500' : 'border-white text-white'}
								${isCurrent ? 'border-yellow-500 text-yellow-500' : ''}
								hover:border-red-500 hover:text-red-500
								focus:border-red-600 focus:text-red-600
							`}>
							<span className="text-sm">{dayName}</span>
							{dayDate.getDate()}
						</Button>
					);
				})}
			</div>

			{/* Shift Cards Below Buttons */}
			<div className="mt-4 space-y-2">
				{shifts.length > 0 ? (
					[...shifts]
						.sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort by start time
						.map((shift) => {
							// Ensure `start` and `end` are parsed correctly
							const shiftStart = new Date(shift.start);
							const shiftEnd = new Date(shift.end);

							// 🔹 Check if shift has ended
							const isPastShift = shiftEnd < new Date();

							return (
								<div
									key={shift.id}
									className={`p-4 rounded-lg shadow-md border ${
										isPastShift
											? 'bg-gray-300 dark:bg-gray-700 opacity-50'
											: 'bg-white dark:bg-gray-800'
									} border-gray-200 dark:border-gray-700`}>
									<p
										className={`font-semibold ${
											isPastShift
												? 'text-gray-500 dark:text-gray-400'
												: 'text-gray-900 dark:text-white'
										}`}>
										{shift.extendedProps.shiftTypeLong}
									</p>
									<p
										className={`text-sm ${
											isPastShift
												? 'text-gray-500 dark:text-gray-400'
												: 'text-gray-600 dark:text-gray-300'
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
								</div>
							);
						})
				) : (
					<p className="text-gray-500 dark:text-gray-400 text-center">
						No shifts scheduled for this day.
					</p>
				)}
			</div>
		</div>
	);
};

export default WeekComponent;
