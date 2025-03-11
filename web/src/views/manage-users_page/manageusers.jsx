import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Sorting icons
import Layout from '../../components/Layout';
import LoadingScreen from '../../components/LoadingScreen';
import { AuthContext } from '../../context/AuthContext';

const ManageUsers = () => {
	const { user } = useContext(AuthContext);

	// State for users, filters, and loading/error states
	const [users, setUsers] = useState([]);
	const [role, setRole] = useState(''); // Role filter
	const [searchQuery, setSearchQuery] = useState(''); // Global search
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [columnFilters, setColumnFilters] = useState({}); // Column-specific filters

	// Function to fetch users
	const fetchUsers = async (role = '') => {
		setLoading(true);
		setError(null);

		try {
			const url =
				role === 'worker'
					? `${import.meta.env.VITE_BASE_ADDR}/get-accounts?type=worker`
					: role === 'admin'
					? `${import.meta.env.VITE_BASE_ADDR}/get-accounts?type=admin`
					: role === 'maintainer'
					? `${import.meta.env.VITE_BASE_ADDR}/get-accounts?type=maintainer`
					: `${import.meta.env.VITE_BASE_ADDR}/get-accounts`;

			const response = await fetch(url);
			if (!response.ok) throw new Error('Failed to fetch users.');

			const data = await response.json();
			setUsers(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Fetch users on component mount
	useEffect(() => {
		fetchUsers();
	}, []);

	// Handle role selection change
	const handleRoleChange = (value) => {
		setRole(value === 'all' ? '' : value); // Set "" if "all" is selected
		fetchUsers(value === 'all' ? '' : value);
	};

	// Table columns
	const columns = [
		{ accessorKey: 'first_name', header: 'First Name', enableSorting: true },
		{ accessorKey: 'last_name', header: 'Last Name', enableSorting: true },
		{ accessorKey: 'email', header: 'Email', enableSorting: true },
		{ accessorKey: 'role', header: 'Role', enableSorting: true },
		{
			accessorKey: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Link to={`/user/${row.original.user_id}`}>
					<Button size="sm">View Details</Button>
				</Link>
			),
		},
	];

	// **Optimized Filtering Using useMemo**
	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			// Global search filter
			const globalSearch =
				searchQuery === '' ||
				[user.first_name, user.last_name, user.email]
					.join(' ')
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			// Column-specific filters
			const columnSearch = Object.keys(columnFilters).every((key) => {
				const value = columnFilters[key]?.toLowerCase() || '';
				return user[key]?.toLowerCase().includes(value);
			});

			return globalSearch && columnSearch;
		});
	}, [users, searchQuery, columnFilters]); // 🔥 Only recalculates when dependencies change

	// Setup TanStack Table
	const table = useReactTable({
		data: filteredUsers, // 👈 Now using `filteredUsers`
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			globalFilter: searchQuery,
		},
		onGlobalFilterChange: setSearchQuery,
		manualPagination: false,
	});

	// **Optimized Column Filter Handler**
	const updateColumnFilter = (column, value) => {
		setColumnFilters((prev) => ({
			...prev,
			[column]: value,
		}));
	};

	return (
		<Layout>
			{loading ? (
				<LoadingScreen />
			) : (
				<div className="p-6">
					<h2 className="text-3xl font-semibold mb-6 text-center">
						Manage Users
					</h2>

					{/* Global Search */}
					<div className="mb-4 flex items-center gap-2">
						<Input
							type="text"
							placeholder="Search all columns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
						/>
						<Button
							onClick={() => setSearchQuery('')}
							variant="outline">
							Clear
						</Button>
					</div>

					{/* Role Selection */}
					<div className="mb-6">
						<Label htmlFor="role">Filter by Role</Label>
						<Select
							onValueChange={handleRoleChange}
							value={role}>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="worker">Worker</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="maintainer">Maintainer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Column-Specific Filters */}
					<div className="grid grid-cols-4 gap-2 mb-4">
						{columns.map(
							(col) =>
								col.accessorKey &&
								col.accessorKey !== 'actions' && (
									<Input
										key={col.accessorKey}
										type="text"
										placeholder={`Filter ${col.header}...`}
										value={columnFilters[col.accessorKey] ?? ''}
										onChange={(e) =>
											updateColumnFilter(col.accessorKey, e.target.value)
										}
										className="w-full"
									/>
								)
						)}
					</div>

					{/* User Table */}
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										const isSorted = header.column.getIsSorted();
										return (
											<TableHead
												key={header.id}
												className="cursor-pointer"
												onClick={header.column.getToggleSortingHandler()}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext()
													  )}
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
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</Layout>
	);
};

export default ManageUsers;
