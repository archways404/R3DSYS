import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState, useMemo } from 'react';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EditShiftDialog = ({ open, onOpenChange, event, onUpdated }) => {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [initialData, setInitialData] = useState(null);
	const [saving, setSaving] = useState(false);

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
				})
				.catch((err) => {
					console.error('Failed to load shift edit info:', err);
				});
		}
	}, [open, event?.shift_id]);

	if (!event) return null;

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
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					assigned_to: selectedUser || null,
					start_time: startTime,
					end_time: endTime,
				}),
			});

			if (!res.ok) throw new Error('Failed to update shift');

			// 🔁 Tell parent to refresh
			onUpdated?.();

			// ✅ Close dialog
			onOpenChange(false);
		} catch (err) {
			console.error('Update failed:', err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="text-sm">
				<DialogHeader>
					<DialogTitle>{event.shift_type_long}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
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

					<div>
						<label className="block text-sm font-medium mb-1">Assigned to</label>
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
												value={user.user_id}>
												{user.first_name} {user.last_name} ✅
											</SelectItem>
										))}
									</SelectGroup>
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
					</div>

					<div className="pt-2 text-right">
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
	);
};

export default EditShiftDialog;
