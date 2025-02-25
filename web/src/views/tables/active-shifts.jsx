import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Sorting icons

export default function ActiveShifts() {
	const [data, setData] = useState([]);
	const [pageSize, setPageSize] = useState(5);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState([]);
	const [selectedShiftIds, setSelectedShiftIds] = useState([]); // Track selected shift IDs
	const [globalFilter, setGlobalFilter] = useState(''); // ShadCN filter state

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/active-schedule-table',
					{
						method: 'GET',
						credentials: 'include',
					}
				);

				if (!response.ok) {
					throw new Error('Failed to fetch schedule data');
				}

				const result = await response.json();
				setData(result);
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
	}, []);

	// Function to handle individual checkbox selection
	const handleCheckboxChange = (shiftId) => {
		setSelectedShiftIds(
			(prevSelected) =>
				prevSelected.includes(shiftId)
					? prevSelected.filter((id) => id !== shiftId) // Remove if already selected
					: [...prevSelected, shiftId] // Add if not selected
		);
	};

	// Select all visible rows
	const selectAllVisible = () => {
		const visibleShiftIds = table
			.getRowModel()
			.rows.map((row) => row.getValue('shift_id'));
		setSelectedShiftIds((prevSelected) => [
			...new Set([...prevSelected, ...visibleShiftIds]),
		]);
	};

	// Select all rows (all entries in the dataset)
	const selectAllEntries = () => {
		const allShiftIds = data.map((row) => row.shift_id);
		setSelectedShiftIds(allShiftIds);
	};

	// Clear all selections
	const clearSelection = () => {
		setSelectedShiftIds([]);
	};

	const columns = [
		{
			id: 'select',
			header: '',
			cell: ({ row }) => {
				const shiftId = row.getValue('shift_id');
				return (
					<Checkbox
						checked={selectedShiftIds.includes(shiftId)}
						onCheckedChange={() => handleCheckboxChange(shiftId)}
					/>
				);
			},
		},
		{ accessorKey: 'shift_id', header: 'Shift ID', enableSorting: true },

		// Format Start Time (HH:MM)
		{
			accessorKey: 'start_time',
			header: 'Start Time',
			enableSorting: true,
			cell: ({ getValue }) => <>{getValue()?.slice(0, 5)}</>,
		},

		// Format End Time (HH:MM)
		{
			accessorKey: 'end_time',
			header: 'End Time',
			enableSorting: true,
			cell: ({ getValue }) => <>{getValue()?.slice(0, 5)}</>,
		},

		// Format Date (YYYY-MM-DD)
		{
			accessorKey: 'date',
			header: 'Date',
			enableSorting: true,
			cell: ({ getValue }) => <>{getValue()?.split('T')[0]}</>,
		},

		{ accessorKey: 'first_name', header: 'First Name', enableSorting: true },
		{ accessorKey: 'last_name', header: 'Last Name', enableSorting: true },
		{ accessorKey: 'email', header: 'Email', enableSorting: true },
		{
			accessorKey: 'name_short',
			header: 'Shift Type (Short)',
			enableSorting: true,
		},
		{
			accessorKey: 'name_long',
			header: 'Shift Type (Long)',
			enableSorting: true,
		},
		{ accessorKey: 'group_name', header: 'Group', enableSorting: true },
		{ accessorKey: 'description', header: 'Description', enableSorting: true },
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			pagination: {
				pageIndex: currentPage,
				pageSize,
			},
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		onPaginationChange: (updater) => {
			const newState = typeof updater === 'function' ? updater({}) : updater;
			setCurrentPage(newState.pageIndex);
		},
		onGlobalFilterChange: setGlobalFilter,
		manualPagination: false,
	});

	return (
		<div className="rounded-md border p-4 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			{/* Filter Input */}
			<div className="mb-4 flex items-center gap-2">
				<Input
					type="text"
					placeholder="Filter all columns..."
					value={globalFilter ?? ''}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="w-full"
				/>
				<Button
					onClick={() => setGlobalFilter('')}
					variant="outline">
					Clear Filter
				</Button>
			</div>

			{/* Buttons for Selection */}
			<div className="flex gap-2 mb-4">
				<Button
					onClick={selectAllVisible}
					variant="outline">
					Select All Visible
				</Button>
				<Button
					onClick={selectAllEntries}
					variant="outline">
					Select All Entries
				</Button>
				<Button
					onClick={clearSelection}
					variant="destructive">
					Clear Selection
				</Button>
			</div>

			{/* Table */}
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="border-b dark:border-gray-700">
							{headerGroup.headers.map((header) => {
								const isSorted = header.column.getIsSorted();
								return (
									<TableHead
										key={header.id}
										className="cursor-pointer select-none"
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
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								className="border-b dark:border-gray-700">
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
			{/* Selected Shift IDs Display */}
			<div className="mt-4">
				<p className="font-semibold">Selected Shift IDs:</p>
				<pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
					{JSON.stringify(selectedShiftIds, null, 2)}
				</pre>
			</div>

			{/* Pagination Controls */}
			<div className="flex justify-between items-center mt-4">
				<Button
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
					disabled={!table.getCanPreviousPage()}>
					Previous
				</Button>
				<span>
					Page {currentPage + 1} of {table.getPageCount()}
				</span>
				<Button
					onClick={() => setCurrentPage((prev) => prev + 1)}
					disabled={!table.getCanNextPage()}>
					Next
				</Button>
			</div>
		</div>
	);
}
