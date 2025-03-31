import React, { useEffect, useState } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	flexRender,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Sorting icons
import { Button } from '@/components/ui/button';
import {
	EnvelopeIcon,
	UserIcon,
	CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingScreen from '../../components/LoadingScreen';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const UserDetail = () => {
	const { uuid } = useParams();
	const [user, setUser] = useState(null);
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [availableGroups, setAvailableGroups] = useState([]);
	const [selectedGroup, setSelectedGroup] = useState('');
	const [role, setRole] = useState('');
	const [authLogs, setAuthLogs] = useState([]);
	const [loadingLogs, setLoadingLogs] = useState(true);
	const [errorLogs, setErrorLogs] = useState(null);
	const [globalFilter, setGlobalFilter] = useState('');
	const { toast } = useToast();

	const navigate = useNavigate(); // Get the navigate function

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${uuid}`);
				if (!response.ok) {
					throw new Error('Failed to fetch user details');
				}
				const data = await response.json();
				if (data) {
					setUser(data);
					setEmail(data.userDetails.email);
					setRole(data.userDetails.role); // initialize the role state
				} else {
					setError('User not found');
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [uuid]);

	// Fetch available schedule groups for assignment (filtered)
	useEffect(() => {
		if (user) {
			const fetchGroups = async () => {
				try {
					const response = await fetch(
						`${import.meta.env.VITE_BASE_ADDR}/getAllScheduleGroups?user_id=${
							user.userDetails.user_id
						}`
					);
					if (!response.ok) {
						throw new Error('Failed to fetch available groups');
					}
					const data = await response.json();
					setAvailableGroups(data);
				} catch (err) {
					toast({
						title: 'Error',
						description: err.message,
						variant: 'destructive',
					});
				}
			};

			fetchGroups();
		}
	}, [user, toast]);

	useEffect(() => {
		const fetchAuthLogs = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-auth-logs?uuid=${uuid}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch authentication logs');
				}
				const data = await response.json();
				setAuthLogs(data);
			} catch (err) {
				setErrorLogs(err.message);
			} finally {
				setLoadingLogs(false);
			}
		};
		fetchAuthLogs();
	}, [uuid]);

	const handleRoleChange = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/updateUserRole`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					user_id: user.userDetails.user_id,
					role: role,
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update role');
			}
			const updatedData = await response.json();
			toast({
				title: 'Success',
				description: 'User role updated successfully.',
				variant: 'success',
			});
			// Update local state so that userDetails reflects the new role.
			setUser((prevUser) => ({
				...prevUser,
				userDetails: {
					...prevUser.userDetails,
					role: updatedData.role,
				},
			}));
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	// Handler for unlocking account
	const handleUnlockAccount = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/unlockAccount`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.userDetails.user_id }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to unlock account');
			}
			toast({
				title: 'Success',
				description: 'Account unlocked successfully.',
				variant: 'success',
			});
			// Update local state to reflect the unlocked account
			setUser((prevUser) => ({
				...prevUser,
				lockoutDetails: {
					...prevUser.lockoutDetails,
					locked: false,
					failed_attempts: 0,
					unlock_time: null,
				},
			}));
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	// Handler for locking account
	const handleLockAccount = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/lockAccount`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: user.userDetails.user_id }),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to lock account');
			}
			// Read the updated lockout details from the response
			const lockoutData = await response.json();
			toast({
				title: 'Success',
				description: 'Account locked successfully.',
				variant: 'success',
			});
			// Update local state to reflect the new lockout details
			setUser((prevUser) => ({
				...prevUser,
				lockoutDetails: lockoutData,
			}));
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	// Reset password handler (unchanged)
	const handleResetPassword = async (e) => {
		e.preventDefault();

		if (!email) {
			toast({
				title: 'Error',
				description: 'Error: Email not found.',
				variant: 'destructive',
			});
			return;
		}

		try {
			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/forgotPassword', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				throw new Error('Failed to send reset link. Please check your email.');
			}

			toast({
				title: 'Success',
				description: 'Password reset link has been sent to your email.',
				variant: 'success',
				duration: 3000,
			});
			setError('');
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
			setError(error.message);
		}
	};

	// Handler for assigning a new schedule group
	const handleAssignGroup = async () => {
		if (!selectedGroup) {
			toast({
				title: 'Error',
				description: 'Please select a schedule group to assign.',
				variant: 'destructive',
			});
			return;
		}

		try {
			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/assignScheduleGroup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: user.userDetails.user_id,
					group_id: selectedGroup,
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to assign schedule group');
			}
			toast({
				title: 'Success',
				description: 'Schedule group assigned successfully.',
				variant: 'success',
			});
			// Update the user's schedule groups (refetch or update locally)
			setUser((prevUser) => ({
				...prevUser,
				scheduleGroups: [
					...prevUser.scheduleGroups,
					availableGroups.find((grp) => grp.group_id === selectedGroup),
				],
			}));
			setSelectedGroup('');
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	// Handler for removing a schedule group
	const handleRemoveGroup = async (groupId) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/removeScheduleGroup?user_id=${
					user.userDetails.user_id
				}&group_id=${groupId}`,
				{
					method: 'DELETE',
				}
			);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to remove schedule group');
			}
			toast({
				title: 'Success',
				description: 'Schedule group removed successfully.',
				variant: 'success',
			});
			// Remove the group from the local state
			setUser((prevUser) => ({
				...prevUser,
				scheduleGroups: prevUser.scheduleGroups.filter((group) => group.group_id !== groupId),
			}));
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
		}
	};

	// Define table columns
	const columns = [
		{ accessorKey: 'ip_address', header: 'IP Address', enableSorting: true },
		{ accessorKey: 'fingerprint', header: 'Fingerprint', enableSorting: true },
		{
			accessorKey: 'success',
			header: 'Success',
			enableSorting: true,
			cell: ({ getValue }) => (
				<span
					className={`px-2 py-1 rounded ${
						getValue() ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
					}`}>
					{getValue() ? '✅ Yes' : '❌ No'}
				</span>
			),
		},
		{
			accessorKey: 'error_message',
			header: 'Error Message',
			cell: ({ getValue }) => <>{getValue() || 'None'}</>,
		},
		{
			accessorKey: 'created_at',
			header: 'Timestamp',
			enableSorting: true,
			cell: ({ getValue }) => <>{new Date(getValue()).toLocaleString()}</>,
		},
	];

	// Set up TanStack Table
	const table = useReactTable({
		data: authLogs,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			globalFilter,
		},
		onGlobalFilterChange: setGlobalFilter,
		manualPagination: false,
	});

	return (
		<Layout>
			{loading ? (
				<LoadingScreen />
			) : (
				<div className="user-detail p-8 mx-auto rounded-lg shadow-lg">
					<Button
						className="text-gray-600 dark:text-gray-300 bg-transparent hover:bg-transparent hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
						onClick={() => navigate('/manage-users')}>
						← Back
					</Button>
					{error ? (
						<p className="text-center text-red-500 font-semibold">{error}</p>
					) : user ? (
						<div className="space-y-8">
							{/* User Details Section */}
							<div className="text-center">
								<div className="mx-auto w-24 h-24 mb-6 rounded-full flex items-center justify-center">
									<UserIcon className="w-16 h-16 text-gray-800 dark:text-gray-200" />
								</div>
								<h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
									{user.userDetails.first_name} {user.userDetails.last_name}
								</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									<span className="font-semibold">UUID:</span> {user.userDetails.user_id}
								</p>
								<div className="space-y-4 text-left">
									<div className="flex items-center space-x-2">
										<EnvelopeIcon className="w-5 h-5 text-blue-500" />
										<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
											Email: <span className="font-normal">{user.userDetails.email}</span>
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<CheckBadgeIcon className="w-5 h-5 text-yellow-500" />
										<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
											Role:{' '}
											<select
												value={role}
												onChange={(e) => setRole(e.target.value)}
												className="p-2 border rounded">
												{role === '' ? <option value="">Select a role</option> : null}
												<option value="admin">Admin</option>
												<option value="worker">Worker</option>
												<option value="maintainer">Maintainer</option>
											</select>
										</p>
										<Button
											onClick={handleRoleChange}
											disabled={role === user.userDetails.role}>
											Update Role
										</Button>
									</div>
								</div>
								<div className="mt-4 flex items-center justify-center space-x-2">
									<Button onClick={handleResetPassword}>Reset Password</Button>
									<Button
										onClick={user.lockoutDetails?.locked ? handleUnlockAccount : handleLockAccount}
										variant="secondary">
										{user.lockoutDetails?.locked ? 'Unlock Account' : 'Lock Account'}
									</Button>
								</div>
							</div>

							{/* Lockout Details Section */}
							<div className=" p-4 rounded-lg">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
									Account Lockout Details
								</h3>
								<ul className="space-y-2">
									<li>
										<span className="font-medium">Failed Attempts:</span>{' '}
										{user.lockoutDetails?.failed_attempts || 0}
									</li>
									<li>
										<span className="font-medium">Last Failed IP:</span>{' '}
										{user.lockoutDetails?.last_failed_ip || 'N/A'}
									</li>
									<li>
										<span className="font-medium">Locked:</span>{' '}
										{user.lockoutDetails?.locked ? 'Yes' : 'No'}
									</li>
									<li>
										<span className="font-medium">Unlock Time:</span>{' '}
										{user.lockoutDetails?.unlock_time || 'N/A'}
									</li>
									<li>
										<span className="font-medium">Last Failed Time:</span>{' '}
										{user.lockoutDetails?.last_failed_time
											? new Date(user.lockoutDetails.last_failed_time).toLocaleString()
											: 'N/A'}
									</li>
								</ul>
							</div>

							{/* Schedule Groups Section */}
							<div className=" p-4 rounded-lg">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
									Schedule Groups
								</h3>
								<ul className="space-y-2">
									{user.scheduleGroups?.length > 0 ? (
										user.scheduleGroups.map((group) => (
											<li
												key={group.group_id}
												className="flex items-center justify-between">
												<span>{group.name}</span>
												<div className="flex items-center space-x-2">
													<span className="text-gray-500 dark:text-gray-400 text-sm">
														{group.group_id}
													</span>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => handleRemoveGroup(group.group_id)}>
														Remove
													</Button>
												</div>
											</li>
										))
									) : (
										<p>No groups assigned</p>
									)}
								</ul>
								{/* Assignment Panel */}
								<div className="mt-4 flex items-center space-x-2">
									<select
										value={selectedGroup}
										onChange={(e) => setSelectedGroup(e.target.value)}
										className="p-2 border rounded">
										<option value="">Select a schedule group to add</option>
										{availableGroups.map((group) => (
											<option
												key={group.group_id}
												value={group.group_id}>
												{group.name}
											</option>
										))}
									</select>
									<Button onClick={handleAssignGroup}>Add Group</Button>
								</div>
							</div>
						</div>
					) : (
						<p className="text-center text-lg text-gray-600 dark:text-gray-300">User not found.</p>
					)}
					{/* Authentication Logs Section */}
					<h3 className="text-2xl font-semibold mb-4">Authentication Logs</h3>

					{/* Loading or Error State */}
					{loadingLogs ? (
						<LoadingScreen />
					) : errorLogs ? (
						<p className="text-red-500">{errorLogs}</p>
					) : authLogs.length === 0 ? (
						<p className="text-gray-500">No authentication logs found.</p>
					) : (
						<>
							{/* Filter Input */}
							<div className="mb-4 flex items-center gap-2">
								<Input
									type="text"
									placeholder="Search logs..."
									value={globalFilter ?? ''}
									onChange={(e) => setGlobalFilter(e.target.value)}
									className="w-full"
								/>
								<Button
									onClick={() => setGlobalFilter('')}
									variant="outline">
									Clear
								</Button>
							</div>

							{/* Table */}
							<Table>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => {
												const isSorted = header.column.getIsSorted();
												return (
													<TableHead
														key={header.id}
														className="cursor-pointer select-none"
														onClick={header.column.getToggleSortingHandler()}>
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
														{isSorted === 'asc' && (
															<ArrowUp className="inline-block w-4 h-4 ml-1" />
														)}
														{isSorted === 'desc' && (
															<ArrowDown className="inline-block w-4 h-4 ml-1" />
														)}
													</TableHead>
												);
											})}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow key={row.id}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="text-center">
												No results found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>

							{/* Pagination Controls */}
							<div className="flex justify-between items-center mt-4">
								<Button
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}>
									Previous
								</Button>
								<span>
									Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
								</span>
								<Button
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}>
									Next
								</Button>
							</div>
						</>
					)}
				</div>
			)}
		</Layout>
	);
};

export default UserDetail;
