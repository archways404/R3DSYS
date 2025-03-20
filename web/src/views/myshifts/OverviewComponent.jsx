import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { PiMicrosoftTeamsLogoFill } from 'react-icons/pi';
import { ArrowRightLeft } from 'lucide-react';
import ShiftRemovalRequests from './ShiftRemovalRequests'; // Import the new component

const OverviewComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);

	const [loadingRequest, setLoadingRequest] = useState(null); // Track request loading state
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

	// Function to handle shift removal request
	const handleShiftRemoval = async (shiftId) => {
		if (loadingRequest) return; // Prevent multiple requests
		setLoadingRequest(shiftId);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/requestShiftRemoval`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						shift_id: shiftId,
						user_id: user.uuid,
					}),
				}
			);

			const data = await response.json();
			if (response.ok) {
				alert('Shift removal request submitted successfully.');
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error('Error submitting shift removal request:', error);
			alert('Failed to request shift removal.');
		} finally {
			setLoadingRequest(null);
		}
	};

	return (
		<div className="p-4">
			{/* Display the Shift Removal Requests Section */}
			<div className="mt-6">
				<ShiftRemovalRequests />
			</div>
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
														onClick={() => handleShiftRemoval(shift.id)}
														className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
														disabled={loadingRequest === shift.id}>
														<ArrowRightLeft className="w-5 h-5" />
														<span>
															{loadingRequest === shift.id
																? 'Requesting...'
																: 'Remove'}
														</span>
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
