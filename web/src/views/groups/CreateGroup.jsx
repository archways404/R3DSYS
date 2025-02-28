import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/components/ui/card';

const CreateGroup = ({ onGroupCreated }) => {
	const { toast } = useToast();

	const [groupName, setGroupName] = useState('');
	const [groupDescription, setGroupDescription] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!groupName.trim()) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Group name is required.',
			});
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/create-schedule-group',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						name: groupName,
						description: groupDescription,
					}),
				}
			);

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Failed to create group');
			}

			toast({
				title: 'Success',
				description: `"${groupName}" created successfully.`,
			});

			// Reset form
			setGroupName('');
			setGroupDescription('');

			if (onGroupCreated) {
				onGroupCreated(); // ✅ This will now trigger checkAuth from GroupRenderer
			}
		} catch (error) {
			console.error('Error creating group:', error);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: 'Failed to create group.',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="max-w-lg mx-auto text-gray-100 p-4 rounded-md shadow-md">
			<CardHeader>
				<CardTitle>Create a New Group</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<div>
						<label className="block text-sm font-medium">Group Name</label>
						<Input
							type="text"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							placeholder="Enter group name"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium">
							Description (Optional)
						</label>
						<Textarea
							value={groupDescription}
							onChange={(e) => setGroupDescription(e.target.value)}
							placeholder="Enter group description"
						/>
					</div>
					<CardFooter className="flex justify-end gap-2">
						<Button
							type="submit"
							disabled={loading}>
							{loading ? 'Creating...' : 'Create Group'}
						</Button>
					</CardFooter>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreateGroup;
