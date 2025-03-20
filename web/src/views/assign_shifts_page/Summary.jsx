import React from 'react';

function Summary({ schedule, assignments }) {
	// Extract all unique available users from the schedule
	const allUsers = new Map();
	schedule.forEach((shift) => {
		shift.available_people.forEach((user) => {
			if (!allUsers.has(user.user_id)) {
				allUsers.set(user.user_id, { ...user, hours: 0 });
			}
		});
	});

	// Calculate total assigned hours
	const totalHours = schedule.reduce((sum, shift) => {
		const shiftDuration =
			(new Date(`1970-01-01T${shift.end_time}`) -
				new Date(`1970-01-01T${shift.start_time}`)) /
			3600000;
		return sum + shiftDuration;
	}, 0);

	// Aggregate assigned hours per user
	assignments.forEach((assignment) => {
		const shift = schedule.find((s) => s.shift_id === assignment.shift_id);
		if (!shift) return;

		const shiftDuration =
			(new Date(`1970-01-01T${shift.end_time}`) -
				new Date(`1970-01-01T${shift.start_time}`)) /
			3600000;

		if (allUsers.has(assignment.user_id)) {
			allUsers.get(assignment.user_id).hours += shiftDuration;
		}
	});

	// Convert to array for rendering, sorting by most assigned hours
	const userSummary = Array.from(allUsers.values())
		.map((user) => ({
			...user,
			percentage:
				totalHours > 0 ? ((user.hours / totalHours) * 100).toFixed(1) : '0.0',
		}))
		.sort((a, b) => b.hours - a.hours);

	return (
		<div className="p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
			<h2 className="text-xl text-center font-semibold mb-2">Total</h2>
			<p className="text-sm text-gray-700 dark:text-gray-300">
				Total Hours: {totalHours.toFixed(1)} hrs
			</p>

			<ul className="mt-2 space-y-2">
				{userSummary.map(
					({ user_id, first_name, last_name, email, hours, percentage }) => (
						<li
							key={user_id}
							className="flex justify-between items-center">
							<span className="text-gray-900 dark:text-gray-200 font-medium">
								{first_name} {last_name} ({email})
							</span>
							<span className="text-gray-600 dark:text-gray-400 text-sm">
								{hours.toFixed(1)} hrs ({percentage}%)
							</span>
						</li>
					)
				)}
			</ul>
		</div>
	);
}

export default Summary;
