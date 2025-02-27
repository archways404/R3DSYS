import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import GroupSelector from './GroupSelector';
import AssignShiftModal from './AssignShiftModal';

function AssignShifts() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State management
	const [groupId, setGroupId] = useState(null);
	const [schedule, setSchedule] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [activeAssignmentShift, setActiveAssignmentShift] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	// Automatically select group if only one exists
	useEffect(() => {
		if (user.groups.length === 1) {
			setGroupId(user.groups[0].id);
		}
	}, [user.groups]);

	// Fetch schedule from API when groupId is selected
	useEffect(() => {
		async function fetchSchedule() {
			if (!groupId) return;
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getScheduleForGroup?group_id=${groupId}`
				);
				const data = await response.json();
				if (response.ok) {
					setSchedule(data.schedule);
				} else {
					toast({ description: data.error, variant: 'destructive' });
				}
			} catch (error) {
				toast({
					description: 'Failed to fetch schedule',
					variant: 'destructive',
				});
			}
		}
		fetchSchedule();
	}, [groupId, toast]);

	// **Group shifts by date**
	const groupedShifts = schedule.reduce((acc, shift) => {
		const shiftDate = new Date(shift.date).toISOString().split('T')[0]; // Extract YYYY-MM-DD format
		if (!acc[shiftDate]) {
			acc[shiftDate] = [];
		}
		acc[shiftDate].push(shift);
		return acc;
	}, {});

	// Handle assignment selection
	const handleSelectAvailablePerson = (shift_id, user) => {
		setAssignments((prev) =>
			prev.some((a) => a.shift_id === shift_id)
				? prev.map((a) => (a.shift_id === shift_id ? { ...a, ...user } : a))
				: [...prev, { shift_id, ...user }]
		);
		setActiveAssignmentShift(null);
	};

	// Submit assignments
	const handleSubmitAssignments = async () => {
		if (assignments.length === 0) {
			toast({
				description: 'No assignments to submit',
				variant: 'destructive',
			});
			return;
		}
		setSubmitting(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/assignShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ assignments }),
				}
			);
			const result = await response.json();
			if (response.ok) {
				toast({ description: result.message, variant: 'default' });
				setAssignments([]);
			} else {
				toast({ description: result.error, variant: 'destructive' });
			}
		} catch (error) {
			toast({
				description: 'Failed to submit assignments',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Layout>
			<div className="p-6 max-w-3xl mx-auto shadow-lg rounded-lg">
				<h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
					Group Schedule
				</h1>

				{/* Show GroupSelector if no group is selected */}
				{!groupId ? (
					<GroupSelector
						groups={user.groups}
						onGroupSelect={setGroupId}
					/>
				) : Object.keys(groupedShifts).length === 0 ? (
					<p className="text-center text-gray-600 dark:text-gray-400">
						No schedule available.
					</p>
				) : (
					<div className="space-y-10">
						{Object.keys(groupedShifts)
							.sort((a, b) => new Date(a) - new Date(b)) // Sort dates from earliest to latest
							.map((date) => {
								// Filter shifts that are unassigned
								const unassignedShifts = groupedShifts[date].filter(
									(shift) => shift.assigned_to === null
								);

								// Skip rendering this date if no unassigned shifts are available
								if (unassignedShifts.length === 0) return null;

								return (
									<div
										key={date}
										className="relative space-y-4">
										{/* Date Header */}
										<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide uppercase bg-gray-200 dark:bg-gray-700 py-3 px-5 rounded-md shadow-sm">
											{new Date(date).toLocaleDateString()}
										</h3>

										{/* Shift Cards */}
										<div className="space-y-4 mt-2">
											{unassignedShifts.map((shift) => {
												const assignedUser = assignments.find(
													(a) => a.shift_id === shift.shift_id
												);
												return (
													<div
														key={shift.shift_id}
														className={`p-4 rounded-lg shadow-md transition-all duration-300 border ${
															assignedUser
																? 'bg-green-500 text-white border-green-700'
																: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:shadow-lg'
														}`}>
														<div className="flex justify-between items-center">
															<p className="font-semibold text-lg">
																{shift.shift_type_short}
															</p>
															<Button
																onClick={() => setActiveAssignmentShift(shift)}>
																{assignedUser ? 'Reassign' : 'Assign Shift'}
															</Button>
														</div>
														<p className="text-sm">
															<strong>Time:</strong>{' '}
															{shift.start_time.slice(0, 5)} -{' '}
															{shift.end_time.slice(0, 5)}
														</p>

														{/* Assigned User Info */}
														{assignedUser && (
															<div className="mt-2 p-2 rounded-md bg-green-600 text-white">
																<p className="text-sm font-medium">
																	Assigned To:
																</p>
																<p className="text-sm">
																	{assignedUser.first_name}{' '}
																	{assignedUser.last_name}
																</p>
																<p className="text-sm">{assignedUser.email}</p>
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
					</div>
				)}

				{/* Submit Assignments Button */}
				{assignments.length > 0 && (
					<div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md">
						<Button
							onClick={handleSubmitAssignments}
							disabled={submitting}
							className="w-full bg-blue-500 hover:bg-blue-600 text-white">
							{submitting ? 'Submitting...' : 'Submit Assignments'}
						</Button>
					</div>
				)}

				{/* Assign Shift Modal */}
				{activeAssignmentShift && (
					<AssignShiftModal
						shift={activeAssignmentShift}
						onClose={() => setActiveAssignmentShift(null)}
						onSelectUser={handleSelectAvailablePerson}
					/>
				)}
			</div>
		</Layout>
	);
}

export default AssignShifts;
