import React from 'react';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const CalDateComponent = ({ month, year, setMonth, setYear }) => {
	const handlePrev = () => {
		if (month === 1) {
			setMonth(12);
			setYear((prev) => prev - 1);
		} else {
			setMonth((prev) => prev - 1);
		}
	};

	const handleNext = () => {
		if (month === 12) {
			setMonth(1);
			setYear((prev) => prev + 1);
		} else {
			setMonth((prev) => prev + 1);
		}
	};

	return (
		<div className="flex items-center space-x-4">
			<Button
				variant="outline"
				onClick={handlePrev}>
				&larr; Prev
			</Button>
			<h2 className="text-lg font-bold text-white">
				{MONTH_NAMES[month - 1]} {year}
			</h2>
			<Button
				variant="outline"
				onClick={handleNext}>
				Next &rarr;
			</Button>
		</div>
	);
};

export default CalDateComponent;
