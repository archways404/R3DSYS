import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import GroupSelector from './GroupSelector';
import ShiftSelector from './ShiftSelector';

function ApplyUnassigned() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State management
	const [groupId, setGroupId] = useState(null);
	const [unassignedShifts, setUnassignedShifts] = useState([]);

	// Automatically select group if only one is available
	useEffect(() => {
		if (user.groups.length === 1) {
			setGroupId(user.groups[0].id);
		}
	}, [user.groups]);

	// Fetch unassigned shifts based on selected group
	useEffect(() => {
		if (groupId) {
			const fetchUnassignedShifts = async () => {
				try {
					const response = await fetch(
						`${
							import.meta.env.VITE_BASE_ADDR
						}/getUnassignedShifts?group_id=${groupId}&user_id=${user.uuid}`
					);
					const data = await response.json();

					if (response.ok) {
						setUnassignedShifts(data.unassigned_shifts || []);
					} else {
						toast({
							description: data.error || 'Failed to fetch unassigned shifts.',
							variant: 'destructive',
						});
					}
				} catch (error) {
					toast({
						description: 'Error fetching unassigned shifts.',
						variant: 'destructive',
					});
				}
			};

			fetchUnassignedShifts();
		}
	}, [groupId, user.uuid, toast]);

	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-screen">
				{/* Show GroupSelector if no group is selected */}
				{!groupId ? (
					<GroupSelector
						groups={user.groups}
						onGroupSelect={setGroupId}
					/>
				) : (
					<div className="w-full max-w-lg p-6 rounded-xl border border-gray-200 dark:border-gray-600">
						{/* Display ShiftSelector */}
						<ShiftSelector
							shifts={unassignedShifts}
							user={user}
							groupId={groupId}
							toast={toast}
							setUnassignedShifts={setUnassignedShifts}
						/>

						{/* Button to re-select group */}
						<Button
							onClick={() => setGroupId(null)}
							className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2">
							Change Group
						</Button>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default ApplyUnassigned;
