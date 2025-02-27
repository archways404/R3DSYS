// CreateSchedule.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import CreateMethod from './CreationMethod';
import CreationTemplate from './CreationTemplate';
import CreationGroup from './CreationGroup';
import CreationDate from './CreationDate';
import CreationCalendar from './CreationCalendar';

const CreateSchedule = () => {
	const { user } = useContext(AuthContext);
	// renderMode controls the overall flow:
	// null = initial method selection,
	// 'manual' = manual entry,
	// 'template' = template selection, etc.
	const [renderMode, setRenderMode] = useState(null);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [selectedYear, setSelectedYear] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState(null);

	/*
	const [renderMode, setRenderMode] = useState('final');
	const [selectedTemplate, setSelectedTemplate] = useState({
		id: '30272fdd-e972-4d0f-8480-26490030b0ad',
		name: 'Helpdesk Standard',
	});
	const [selectedGroup, setSelectedGroup] = useState({
		id: '2c4fe3e6-2859-470b-b1ef-c50bdb7ee0ef',
		name: 'Helpdesk',
	});
	const [selectedYear, setSelectedYear] = useState('2025');
	const [selectedMonth, setSelectedMonth] = useState(3);
	*/

	if (!user) return null;

	// 1. Manual mode is explicit.
	if (renderMode === 'manual') {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center min-h-screen">
					<h2 className="text-2xl font-semibold mb-6">Manual Entry</h2>
					<p className="mb-4">Manual entry form goes here.</p>
					<button
						onClick={() => setRenderMode(null)}
						className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
						Back
					</button>
				</div>
			</Layout>
		);
	}

	// 2. If renderMode is still null, show the initial method selection.
	if (renderMode === null) {
		return <CreateMethod setRenderMode={setRenderMode} />;
	}

	// 3. Now, if renderMode is one of our flow modes (template, group, date, final), check state:
	if (
		renderMode === 'template' ||
		renderMode === 'group' ||
		renderMode === 'date' ||
		renderMode === 'final'
	) {
		// If no template selected, show template selection.
		if (!selectedTemplate) {
			return (
				<CreationTemplate
					onSelectTemplate={(template) => {
						setSelectedTemplate(template);
						// After selecting the template, move to group selection.
						setRenderMode('group');
					}}
					goBack={() => {
						// Go back to the method selection.
						setRenderMode(null);
					}}
				/>
			);
		}
		// If template is selected but no group, show group selection.
		if (selectedTemplate && !selectedGroup) {
			return (
				<CreationGroup
					onSelectGroup={(group) => {
						setSelectedGroup(group);
						// After selecting a group, move to date selection.
						setRenderMode('date');
					}}
					goBack={() => {
						// Go back to template selection.
						setSelectedTemplate(null);
						setRenderMode('template');
					}}
				/>
			);
		}
		// If template and group are selected but date is not, show date selection.
		if (
			selectedTemplate &&
			selectedGroup &&
			(!selectedYear || !selectedMonth)
		) {
			return (
				<CreationDate
					onSelectDate={(year, month) => {
						setSelectedYear(year);
						setSelectedMonth(month);
						// After selecting a date, move to final view.
						setRenderMode('final');
					}}
					goBack={() => {
						// Go back to group selection.
						setSelectedGroup(null);
						setRenderMode('group');
					}}
				/>
			);
		}
		// Finally, if all are set, render the final calendar view.
		if (selectedTemplate && selectedGroup && selectedYear && selectedMonth) {
			return (
				<Layout>
					<div className="min-h-screen p-4">
						<div className="max-w-6xl mx-auto">
							<div className=" rounded-lg p-6 mb-8">
								<div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Using Template:</span>{' '}
										{selectedTemplate.name}
									</p>
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Group:</span>{' '}
										{selectedGroup.name}
									</p>
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Date:</span> {selectedMonth}{' '}
										- {selectedYear}
									</p>
								</div>
								<div className="flex flex-wrap gap-4">
									<button
										onClick={() => {
											setSelectedTemplate(null);
											setRenderMode('template');
										}}
										className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
										Change Template
									</button>
									<button
										onClick={() => {
											setSelectedGroup(null);
											setRenderMode('group');
										}}
										className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
										Change Group
									</button>
									<button
										onClick={() => {
											setSelectedYear(null);
											setSelectedMonth(null);
											setRenderMode('date');
										}}
										className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
										Change Date
									</button>
								</div>
							</div>
							<div className="rounded-lg p-4">
								<div
									className="w-full"
									style={{ height: 'calc(100vh - 250px)' }}>
									<CreationCalendar
										selectedTemplate={selectedTemplate}
										selectedGroup={selectedGroup}
										selectedYear={selectedYear}
										selectedMonth={selectedMonth}
									/>
								</div>
							</div>
						</div>
					</div>
				</Layout>
			);
		}
	}

	// Fallback – should not get here.
	return null;
};

export default CreateSchedule;
