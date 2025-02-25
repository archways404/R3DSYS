import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react'; // Icons for sorting

export default function ActiveShifts() {
	const [data, setData] = useState([]);
	const [pageSize, setPageSize] = useState(5);
	const [currentPage, setCurrentPage] = useState(0);
	const [sorting, setSorting] = useState([]);

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

	const columns = [
		{ accessorKey: 'shift_id', header: 'Shift ID', enableSorting: true },
		{ accessorKey: 'start_time', header: 'Start Time', enableSorting: true },
		{ accessorKey: 'end_time', header: 'End Time', enableSorting: true },
		{ accessorKey: 'date', header: 'Date', enableSorting: true },
		{ accessorKey: 'description', header: 'Description', enableSorting: true },
		{ accessorKey: 'first_name', header: 'First Name', enableSorting: true },
		{ accessorKey: 'last_name', header: 'Last Name', enableSorting: true },
		{ accessorKey: 'email', header: 'Email', enableSorting: true },
		{ accessorKey: 'group_name', header: 'Group', enableSorting: true },
		{
			accessorKey: 'name_long',
			header: 'Shift Type (Long)',
			enableSorting: true,
		},
		{
			accessorKey: 'name_short',
			header: 'Shift Type (Short)',
			enableSorting: true,
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			pagination: {
				pageIndex: currentPage,
				pageSize,
			},
			sorting,
		},
		onSortingChange: setSorting,
		onPaginationChange: (updater) => {
			const newState = typeof updater === 'function' ? updater({}) : updater;
			setCurrentPage(newState.pageIndex);
		},
		manualPagination: false,
	});

	return (
		<div className="rounded-md border p-4">
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
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>{cell.getValue()}</TableCell>
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
