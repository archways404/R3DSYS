import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // Import ShadCN Skeleton

const DayOverviewComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);
	if (!user) return null;

	// Get today's date
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Normalize time to avoid issues with comparisons

	// Filter shifts for the current user within the current day
	const userShifts = shifts.filter((shift) => {
		const shiftStart = new Date(shift.start);
		shiftStart.setHours(0, 0, 0, 0); // Normalize time for comparison

		return (
			shift.extendedProps.assignedUserId === user.uuid &&
			shiftStart.getTime() === today.getTime()
		);
	});

	// Sort by start time
	userShifts.sort((a, b) => new Date(a.start) - new Date(b.start));

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold text-center mb-4">
				{today.toLocaleDateString('en-SE', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})}
			</h2>

			<div className="mt-8 space-y-1 w-full">
				{userShifts.length > 0 ? (
					userShifts.map((shift) => {
						const shiftStart = new Date(shift.start);
						const shiftEnd = new Date(shift.end);

						// 🔹 Check if shift has ended
						const isPastShift = shiftEnd < new Date();

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
							</div>
						);
					})
				) : (
					<p className="text-gray-500 dark:text-gray-400 text-center">
						No assigned shifts today.
					</p>
				)}
			</div>
		</div>
	);
};

export default DayOverviewComponent;
