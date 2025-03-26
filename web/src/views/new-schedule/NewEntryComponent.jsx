import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useState, useEffect, useMemo } from 'react';

const NewEntryComponent = ({ open, onOpenChange, date, onCreated, groups = [] }) => {
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [shiftType, setShiftType] = useState('');
	const [selectedUser, setSelectedUser] = useState('');
	const [selectedGroup, setSelectedGroup] = useState('');
	const [saving, setSaving] = useState(false);

	const [users, setUsers] = useState([]);
	const [shiftTypes, setShiftTypes] = useState([]);

	const [hasFetched, setHasFetched] = useState(false);

	const groupIds = groups.map((g) => g.id);

	useEffect(() => {
		if (!open || !selectedGroup || hasFetched) return;

		let cancelled = false;

		const fetchData = async () => {
			try {
				const [shiftRes, userRes] = await Promise.all([
					fetch(`${import.meta.env.VITE_BASE_ADDR}/shift-types`),
					fetch(`${import.meta.env.VITE_BASE_ADDR}/grp_users?group_id=${selectedGroup}`),
				]);

				if (cancelled) return;

				const shiftData = await shiftRes.json();
				const userData = await userRes.json();

				setShiftTypes(shiftData);
				setUsers(userData);
				setHasFetched(true);
			} catch (err) {
				if (!cancelled) console.error(err);
			}
		};

		fetchData();

		return () => {
			cancelled = true;
		};
	}, [open, selectedGroup, hasFetched]);

	const availableUsers = useMemo(
		() => users.filter((u) => u.available).sort((a, b) => a.first_name.localeCompare(b.first_name)),
		[users]
	);

	const unavailableUsers = useMemo(
		() =>
			users.filter((u) => !u.available).sort((a, b) => a.first_name.localeCompare(b.first_name)),
		[users]
	);

	const handleCreate = async () => {
		if (!shiftType || !startTime || !endTime) return;

		setSaving(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/shift/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date,
					start_time: startTime,
					end_time: endTime,
					shift_type_id: shiftType,
					assigned_to: selectedUser || null,
					schedule_group_id: selectedGroup,
				}),
			});
			if (!res.ok) throw new Error('Failed to create shift');

			onCreated?.();
			onOpenChange(false);
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New {date}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Group Selector */}
					<Select
						value={selectedGroup}
						onValueChange={setSelectedGroup}>
						<SelectTrigger>
							<SelectValue placeholder="Select group" />
						</SelectTrigger>
						<SelectContent>
							{groups.map((group) => (
								<SelectItem
									key={group.id}
									value={group.id}>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{!selectedGroup ? (
						<p className="text-sm text-gray-400">Please select a group to continue</p>
					) : (
						<>
							{/* Shift Type Selector */}
							<Select
								value={shiftType}
								onValueChange={setShiftType}>
								<SelectTrigger>
									<SelectValue placeholder="Select shift type" />
								</SelectTrigger>
								<SelectContent>
									{shiftTypes.map((type) => (
										<SelectItem
											key={type.id}
											value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{/* Time Inputs */}
							<div>
								<label
									className="block text-sm font-medium mb-1"
									htmlFor="start-time">
									Start Time
								</label>
								<Input
									id="start-time"
									type="time"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
								/>
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-1"
									htmlFor="end-time">
									End Time
								</label>
								<Input
									id="end-time"
									type="time"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
								/>
							</div>

							{/* Optional User Selector */}
							<Select
								value={selectedUser}
								onValueChange={setSelectedUser}>
								<SelectTrigger>
									<SelectValue placeholder="Assign to (optional)" />
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
						</>
					)}
					<Button
						onClick={handleCreate}
						disabled={saving || !shiftType || !startTime || !endTime}>
						{saving ? 'Saving...' : 'Create'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default NewEntryComponent;
