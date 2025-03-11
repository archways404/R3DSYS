import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { PiMicrosoftTeamsLogoFill } from 'react-icons/pi';
import { ArrowRightLeft } from 'lucide-react';

const OverviewComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);
	if (!user) return null;

	// Filter shifts for the current user (without restricting to the current month)
	const userShifts = shifts.filter(
		(shift) => shift.extendedProps.assignedUserId === user.uuid
	);

	// Group shifts by day
	const groupedShifts = userShifts.reduce((acc, shift) => {
		const shiftDate = new Date(shift.start);
		const formattedDate = shiftDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD

		if (!acc[formattedDate]) acc[formattedDate] = [];
		acc[formattedDate].push(shift);
		return acc;
	}, {});

	// Sort dates in ascending order
	const sortedDays = Object.keys(groupedShifts).sort(
		(a, b) => new Date(a) - new Date(b)
	);

	// Handlers for button clicks
	const handleTeamsChat = (shiftId) => {
		console.log(`Teams chat for ${shiftId}`);
		// Implement sick leave logic here
	};

	const handleTradeRequest = (shiftId) => {
		console.log(`Requested trade for shift ${shiftId}.`);
		// Implement trade request logic here
	};

	return (
		<div className="p-4">
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

												{/* Buttons */}
												<div className="flex gap-x-3">
													<button
														onClick={() => handleTeamsChat(shift.id)}
														className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all">
														<PiMicrosoftTeamsLogoFill className="w-5 h-5" />
														<span>Chat</span>
													</button>

													<button
														onClick={() => handleTradeRequest(shift.id)}
														className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-all">
														<ArrowRightLeft className="w-5 h-5" />
														<span>Trade</span>
													</button>
												</div>
											</div>
										);
									})}
							</div>
						</div>
					))
				) : (
					<p className="text-gray-500 dark:text-gray-400 text-center">
						No assigned shifts.
					</p>
				)}
			</div>
		</div>
	);
};

export default OverviewComponent;
