// CreationDate.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const CreationDate = ({ onSelectDate, goBack }) => {
	const { user } = useContext(AuthContext);

	// Get current date values.
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;

	// Determine the default values:
	let defaultYear = currentYear;
	let defaultMonth = currentMonth + 1;
	if (defaultMonth > 12) {
		defaultMonth = 1;
		defaultYear = currentYear + 1;
	}

	const [selectedYear, setSelectedYear] = useState(defaultYear.toString());
	const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

	// Generate a list of years from current year - 4 to current year + 4.
	const years = Array.from(
		{ length: 9 },
		(_, index) => currentYear - 4 + index
	);

	const months = [
		{ value: 1, name: 'January' },
		{ value: 2, name: 'February' },
		{ value: 3, name: 'March' },
		{ value: 4, name: 'April' },
		{ value: 5, name: 'May' },
		{ value: 6, name: 'June' },
		{ value: 7, name: 'July' },
		{ value: 8, name: 'August' },
		{ value: 9, name: 'September' },
		{ value: 10, name: 'October' },
		{ value: 11, name: 'November' },
		{ value: 12, name: 'December' },
	];

	const handleSubmit = () => {
		if (selectedYear && selectedMonth) {
			onSelectDate(selectedYear, selectedMonth);
		}
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen space-y-6">
				<h2 className="text-2xl font-semibold">Select Date</h2>

				{/* Year Selector */}
				<div className="w-64">
					<label className="block mb-1 font-medium">Year:</label>
					<Select
						defaultValue={selectedYear}
						value={selectedYear}
						onValueChange={setSelectedYear}>
						<SelectTrigger className="w-full border rounded p-2">
							<SelectValue placeholder="Select Year" />
						</SelectTrigger>
						<SelectContent>
							{years.map((year) => (
								<SelectItem
									key={year}
									value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Month Selector */}
				<div className="w-64">
					<label className="block mb-1 font-medium">Month:</label>
					<Select
						defaultValue={selectedMonth}
						value={selectedMonth}
						onValueChange={setSelectedMonth}>
						<SelectTrigger className="w-full border rounded p-2">
							<SelectValue placeholder="Select Month" />
						</SelectTrigger>
						<SelectContent>
							{months.map((month) => (
								<SelectItem
									key={month.value}
									value={month.value}>
									{month.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Buttons */}
				<div className="flex space-x-4">
					<button
						onClick={goBack}
						className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
						Back
					</button>
					<button
						onClick={handleSubmit}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
						Next
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default CreationDate;
