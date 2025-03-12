import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import GroupSelector from './GroupSelector';
import ShiftsForDay from './ShiftsForDay';
import Summary from './Summary'; // Import the summary component

function AssignShifts() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	const [groupId, setGroupId] = useState(null);
	const [schedule, setSchedule] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [activeDateIndex, setActiveDateIndex] = useState(0);

	useEffect(() => {
		if (user.groups.length === 1) {
			setGroupId(user.groups[0].id);
		}
	}, [user.groups]);

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
		// Create a date object and increment by 1 day if needed
		let shiftDate = new Date(shift.date);
		shiftDate.setDate(shiftDate.getDate() + 1); // Add 1 day

		const formattedDate = shiftDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD

		if (!acc[formattedDate]) {
			acc[formattedDate] = [];
		}
		acc[formattedDate].push(shift);
		return acc;
	}, {});

	// Sorted date list
	const dates = Object.keys(groupedShifts).sort(
		(a, b) => new Date(a) - new Date(b)
	);

	// Handle assignment selection
	const handleSelectAvailablePerson = (shift_id, user) => {
		setAssignments((prev) =>
			prev.some((a) => a.shift_id === shift_id)
				? prev.map((a) => (a.shift_id === shift_id ? { ...a, ...user } : a))
				: [...prev, { shift_id, ...user }]
		);
	};

	const handleRemoveAssignment = (shift_id) => {
		setAssignments((prev) => prev.filter((a) => a.shift_id !== shift_id));
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
					Reporting
				</h1>

				{/* Summary Component */}
				{assignments.length > 0 && (
					<Summary
						schedule={schedule}
						assignments={assignments}
					/>
				)}

				{assignments.length > 0 && (
					<div className="mt-6 rounded-lg mb-6 shadow-md">
						<Button
							onClick={handleSubmitAssignments}
							disabled={submitting}
							className="w-full bg-blue-500 hover:bg-blue-600 text-white">
							{submitting ? 'Submitting...' : 'Submit Assignments'}
						</Button>
					</div>
				)}

				{!groupId ? (
					<GroupSelector
						groups={user.groups}
						onGroupSelect={setGroupId}
					/>
				) : dates.length === 0 ? (
					<p className="text-center text-gray-600 dark:text-gray-400">
						No schedule available.
					</p>
				) : (
					<ShiftsForDay
						date={dates[activeDateIndex]}
						shifts={groupedShifts[dates[activeDateIndex]]}
						assignments={assignments}
						onAssignShift={handleSelectAvailablePerson}
						onRemoveAssignment={handleRemoveAssignment}
						onNext={
							activeDateIndex < dates.length - 1
								? () => setActiveDateIndex(activeDateIndex + 1)
								: null
						}
						onPrev={
							activeDateIndex > 0
								? () => setActiveDateIndex(activeDateIndex - 1)
								: null
						}
					/>
				)}
			</div>
		</Layout>
	);
}

export default AssignShifts;