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
	); // Adjust for Sunday

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
        bg-transparent hover:bg-transparent // No background at any state
        border-2
        ${
					isPast
						? 'border-gray-700 text-gray-500' // Past days (darkened)
						: 'border-white text-white' // Default state
				}
        ${
					isCurrent ? 'border-yellow-500 text-yellow-500' : '' // Today in yellow
				}
        hover:border-red-500 hover:text-red-500 // Hover effect in red
        focus:border-red-600 focus:text-red-600 // Selected day stays red
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
						.sort((a, b) => a.start_time.localeCompare(b.start_time)) // Sort by start_time
						.map((shift) => {
							if (!shift.date || !shift.start_time || !shift.end_time)
								return null; // Ensure valid data

							// Ensure `shift.date` is treated as a local date
							const shiftDateLocal = new Date(shift.date);
							shiftDateLocal.setHours(0, 0, 0, 0); // Normalize time

							// Construct full timestamps using `shiftDateLocal`
							const shiftStart = new Date(
								`${shiftDateLocal.toISOString().split('T')[0]}T${
									shift.start_time
								}`
							);
							const shiftEnd = new Date(
								`${shiftDateLocal.toISOString().split('T')[0]}T${
									shift.end_time
								}`
							);

							// 🔹 Check if shift has ended
							const isPastShift = shiftEnd < new Date();

							/*
							console.log('shiftEnd', shiftEnd);
							console.log('new Date()', new Date());
							console.log('isPastShift', shiftEnd < new Date());
            */

							/*

							return (
								<div
									key={shift.shift_id}
									className={`p-4 rounded-lg shadow-md border 
              ${
								isPastShift
									? 'bg-gray-300 dark:bg-gray-700 opacity-50'
									: 'bg-white dark:bg-gray-800'
							} 
              border-gray-200 dark:border-gray-700`}>
									<p
										className={`font-semibold ${
											isPastShift
												? 'text-gray-500 dark:text-gray-400'
												: 'text-gray-900 dark:text-white'
										}`}>
										{shift.shift_type_long}
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
        */
							return (
								<div
									key={shift.shift_id}
									className="p-4 rounded-lg shadow-md border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
									<p className="font-semibold text-gray-900 dark:text-white">
										{shift.shift_type_long}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-300">
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
