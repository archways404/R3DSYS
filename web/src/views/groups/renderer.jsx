import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '@/components/Layout';
import CreateGroup from './CreateGroup';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { FaTrash } from 'react-icons/fa';

function GroupRenderer() {
	const [renderState, setRenderState] = useState('default');
	const { user } = useContext(AuthContext);
	const { toast } = useToast();
	const [groupToDelete, setGroupToDelete] = useState(null);

	if (!user) return null;

	const handleDeleteGroup = async () => {
		if (!groupToDelete) return;

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/delete-schedule-group/${
					groupToDelete.id
				}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete group');
			}

			toast({
				title: 'Group Deleted',
				description: `Successfully deleted "${groupToDelete.name}".`,
			});

			// Remove deleted group from UI
			user.groups = user.groups.filter(
				(group) => group.id !== groupToDelete.id
			);
		} catch (error) {
			console.error('Error deleting group:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to delete group.',
			});
		} finally {
			setGroupToDelete(null); // Close dialog
		}
	};

	return (
		<Layout>
			<div className="max-w-3xl mx-auto p-6">
				{/* Top Action Buttons */}
				<div className="flex justify-between items-center mb-6">
					{renderState === 'default' ? (
						<>
							<h2 className="text-2xl font-bold text-white"></h2>
							<Button
								variant="default"
								onClick={() => setRenderState('create-group')}
								className="px-5 py-2 text-md font-semibold">
								+ Create Group
							</Button>
						</>
					) : (
						<Button
							variant="outline"
							onClick={() => setRenderState('default')}
							className="text-white">
							← Back
						</Button>
					)}
				</div>

				{/* Render User Groups */}
				{renderState === 'default' && (
					<Card className="text-gray-100 rounded-lg">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">
								Your Groups
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{user.groups.map((group) => (
									<li
										key={group.id}
										className="border border-gray-700 px-4 py-3 rounded-md text-lg font-medium flex justify-between items-center transition hover:bg-gray-700 cursor-pointer">
										{group.name}
										<Button
											variant="ghost"
											onClick={() => setGroupToDelete(group)}
											className="hover:text-red-500">
											<FaTrash />
										</Button>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}

				{/* Render CreateGroup when selected */}
				{renderState === 'create-group' && (
					<Card className="text-gray-100 rounded-lg shadow-lg">
						<CardHeader>
							<CardTitle className="text-lg font-semibold">
								Create a New Group
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CreateGroup />
						</CardContent>
					</Card>
				)}

				{/* Delete Confirmation Dialog */}
				{groupToDelete && (
					<Dialog
						open={true}
						onOpenChange={() => setGroupToDelete(null)}>
						<DialogContent>
							<DialogTitle>Confirm Deletion</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete{' '}
								<strong>{groupToDelete.name}</strong>? This action cannot be
								undone.
							</DialogDescription>
							<div className="flex justify-end gap-2 mt-4">
								<Button
									variant="outline"
									onClick={() => setGroupToDelete(null)}>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDeleteGroup}>
									Confirm Delete
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		</Layout>
	);
}

export default GroupRenderer;
