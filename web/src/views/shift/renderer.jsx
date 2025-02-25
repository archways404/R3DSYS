import { useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import Layout from '../../components/Layout';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ShiftRenderer() {
	const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls the Dialog
	const [shiftTypes, setShiftTypes] = useState([]);
	const [newShiftType, setNewShiftType] = useState({
		name_long: '',
		name_short: '',
	});

	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	const allCategories = ['necessary', 'preferences', 'analytics'];
	const permissionsObject = allCategories.reduce((acc, category) => {
		acc[category] = consent?.acceptedCategories?.includes(category) ?? false;
		return acc;
	}, {});

	if (!user) {
		return null;
	}

	const fetchShiftTypes = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/getShiftTypes'
			);
			const data = await response.json();
			setShiftTypes(data.shift_types);
		} catch (error) {
			console.error('Error fetching shift types:', error);
		}
	};

	const createShiftType = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/createShiftType',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newShiftType),
				}
			);
			const data = await response.json();
			fetchShiftTypes();
			setIsDialogOpen(false); // Close the dialog after creation
		} catch (error) {
			console.error('Error creating shift type:', error);
		}
	};

	useEffect(() => {
		fetchShiftTypes();
	}, [user]);

	return (
		<Layout>
			<div className="max-w-4xl mx-auto p-8">
				{/* Title */}
				<h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
					Shift Types
				</h2>

				{/* Shift List */}
				<ul className="bg-transparent dark:bg-transparent p-4 space-y-2">
					{shiftTypes.length > 0 ? (
						shiftTypes.map((shift) => (
							<li
								key={shift.shift_type_id}
								className="border-b border-gray-300 dark:border-gray-700 py-2 last:border-none text-gray-800 dark:text-gray-300">
								<span className="font-medium">{shift.name_long}</span>{' '}
								<span className="text-gray-500 dark:text-gray-400">
									({shift.name_short})
								</span>
							</li>
						))
					) : (
						<li className="text-gray-600 dark:text-gray-400">
							No shift types available.
						</li>
					)}
				</ul>

				{/* Create Shift Type - Dialog Button */}
				<div className="mt-6">
					<Dialog
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
								Create New Shift
							</Button>
						</DialogTrigger>

						{/* Dialog Content */}
						<DialogContent className="bg-transparent dark:bg-transparent rounded-lg shadow-lg">
							<DialogHeader>
								<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-200">
									Create New Shift Type
								</DialogTitle>
								<DialogDescription className="text-gray-500 dark:text-gray-400">
									Enter details for the new shift type.
								</DialogDescription>
							</DialogHeader>

							{/* Input Fields */}
							<div className="flex flex-col space-y-4">
								<Input
									type="text"
									placeholder="Long Name"
									value={newShiftType.name_long}
									onChange={(e) =>
										setNewShiftType({
											...newShiftType,
											name_long: e.target.value,
										})
									}
									className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:bg-transparent text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<Input
									type="text"
									placeholder="Short Name"
									value={newShiftType.name_short}
									onChange={(e) =>
										setNewShiftType({
											...newShiftType,
											name_short: e.target.value,
										})
									}
									className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:bg-transparent text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							{/* Create Button Inside Dialog */}
							<Button
								onClick={createShiftType}
								className="mt-4 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
								Create Shift Type
							</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</Layout>
	);
}

export default ShiftRenderer;
