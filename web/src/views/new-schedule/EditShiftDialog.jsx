import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EditShiftDialog = ({ open, onOpenChange, event, onUpdated }) => {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [initialData, setInitialData] = useState(null);
	const [saving, setSaving] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (open && event?.shift_id) {
			fetch(`${import.meta.env.VITE_BASE_ADDR}/shift/${event.shift_id}/edit-info`)
				.then((res) => res.json())
				.then((data) => {
					setUsers(data.users || []);
					setSelectedUser(data.shift.assigned_to || '');
					setStartTime(data.shift.start_time?.slice(0, 5) || '');
					setEndTime(data.shift.end_time?.slice(0, 5) || '');

					setInitialData({
						assigned_to: data.shift.assigned_to || '',
						start_time: data.shift.start_time?.slice(0, 5) || '',
						end_time: data.shift.end_time?.slice(0, 5) || '',
					});
					setLoading(false); // ✅ loading is done
				})
				.catch((err) => {
					console.error('Failed to load shift edit info:', err);
				});
		}
	}, [open, event?.shift_id]);

	const availableUsers = useMemo(
		() => users.filter((u) => u.available).sort((a, b) => a.first_name.localeCompare(b.first_name)),
		[users]
	);

	const unavailableUsers = useMemo(
		() =>
			users.filter((u) => !u.available).sort((a, b) => a.first_name.localeCompare(b.first_name)),
		[users]
	);

	const hasChanges =
		initialData &&
		(selectedUser !== initialData.assigned_to ||
			startTime !== initialData.start_time ||
			endTime !== initialData.end_time);

	const handleUpdate = async () => {
		if (!hasChanges || saving) return;

		setSaving(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/shift/${event.shift_id}/update`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					assigned_to: selectedUser || null,
					start_time: startTime,
					end_time: endTime,
				}),
			});
			if (!res.ok) throw new Error('Failed to update shift');
			onUpdated?.();
			onOpenChange(false);
		} catch (err) {
			console.error('Update failed:', err);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/shift/${event.shift_id}/delete`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!res.ok) throw new Error('Failed to delete shift');
			onUpdated?.();
			setDeleteDialogOpen(false);
			onOpenChange(false);
		} catch (err) {
			console.error('Delete failed:', err);
		}
	};

	if (!event) return null;

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={onOpenChange}>
				<DialogContent className="text-sm">
					<DialogHeader>
						<DialogTitle>{event.shift_type_long}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						{loading ? (
							<div className="flex gap-4">
								<Skeleton className="h-10 w-full rounded-md" />
								<Skeleton className="h-10 w-full rounded-md" />
							</div>
						) : (
							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-sm font-medium mb-1">Start Time</label>
									<Input
										type="time"
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
									/>
								</div>
								<div className="flex-1">
									<label className="block text-sm font-medium mb-1">End Time</label>
									<Input
										type="time"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
									/>
								</div>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium mb-1">Assigned to</label>
							{loading ? (
								<Skeleton className="h-10 w-full rounded-md" />
							) : (
								<Select
									value={selectedUser}
									onValueChange={setSelectedUser}>
									<SelectTrigger>
										<SelectValue placeholder="Select a user" />
									</SelectTrigger>
									<SelectContent>
										{availableUsers.length > 0 && (
											<SelectGroup>
												<SelectLabel>Available Users</SelectLabel>
												{availableUsers.map((user) => (
													<SelectItem
														key={user.user_id}
														value={user.user_id}
														className="text-green-500 hover:text-green-400">
														{user.first_name} {user.last_name}
													</SelectItem>
												))}
											</SelectGroup>
										)}
										{/* Stylish separator */}
										{availableUsers.length > 0 && unavailableUsers.length > 0 && (
											<Separator className="my-2 mx-auto bg-gray-500 h-px w-[75%]" />
										)}

										{unavailableUsers.length > 0 && (
											<SelectGroup>
												<SelectLabel>Other Users</SelectLabel>
												{unavailableUsers.map((user) => (
													<SelectItem
														key={user.user_id}
														value={user.user_id}>
														{user.first_name} {user.last_name}
													</SelectItem>
												))}
											</SelectGroup>
										)}
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="pt-2 flex justify-between">
							<DialogTrigger asChild>
								<Button
									variant="destructive"
									onClick={() => setDeleteDialogOpen(true)}>
									Delete
								</Button>
							</DialogTrigger>

							<Button
								variant="default"
								onClick={handleUpdate}
								disabled={!hasChanges || saving}>
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you absolutely sure?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete the shift from the
							schedule.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}>
							Confirm Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default EditShiftDialog;
