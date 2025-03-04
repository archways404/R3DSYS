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
							onClick={() => onDateSelect(dayDate)} // Pass selected date to parent
							className={`w-full h-16 flex flex-col justify-center items-center text-xl font-bold rounded-lg transition-all ${
								isCurrent
									? 'bg-primary text-white'
									: isPast
									? 'opacity-50 text-gray-400 pointer-events-none'
									: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
							}`}
							disabled={isPast} // Disable past dates
						>
							<span className="text-sm">{dayName}</span>
							{dayDate.getDate()}
						</Button>
					);
				})}
			</div>

			{/* Shift Cards Below Buttons */}
			<div className="mt-4 space-y-2">
				{shifts.length > 0 ? (
					shifts.map((shift) => {
						// Construct full timestamps using date + start_time & end_time
						const shiftStart = new Date(
							`${shift.date.split('T')[0]}T${shift.start_time}`
						);
						const shiftEnd = new Date(
							`${shift.date.split('T')[0]}T${shift.end_time}`
						);

						return (
							<div
								key={shift.shift_id}
								className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
								<p className="font-semibold text-gray-900 dark:text-white">
									{shift.shift_type_long}
								</p>
								<p className="text-gray-600 dark:text-gray-300 text-sm">
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
