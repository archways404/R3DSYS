import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

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

			<div className="space-y-6">
				{userShifts.length > 0 ? (
					userShifts.map((shift) => {
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
