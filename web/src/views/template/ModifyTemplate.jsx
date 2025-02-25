import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const daysOfWeek = [
	{ id: 1, name: 'Monday' },
	{ id: 2, name: 'Tuesday' },
	{ id: 3, name: 'Wednesday' },
	{ id: 4, name: 'Thursday' },
	{ id: 5, name: 'Friday' },
	{ id: 6, name: 'Saturday' },
	{ id: 7, name: 'Sunday' },
];

function ModifyTemplate({ templateId, onClose }) {
	const { user } = useContext(AuthContext);
	if (!user) {
		return null;
	}

	const [shiftTypes, setShiftTypes] = useState([]);
	const [currentDay, setCurrentDay] = useState(1);
	const [entries, setEntries] = useState([]);

	// States for add/edit functionality
	const [showAddEntryForm, setShowAddEntryForm] = useState(false);
	const [newEntry, setNewEntry] = useState({
		shift_type_id: '',
		title: '',
		start_time: '',
		end_time: '',
	});
	const [editingIndex, setEditingIndex] = useState(null);

	// New state to toggle the summary view
	const [showSummary, setShowSummary] = useState(false);

	// Helper function to format time strings ("10:00:00" => "10:00")
	const formatTime = (timeStr) => {
		if (!timeStr) return timeStr;
		const parts = timeStr.split(':');
		return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
	};

	useEffect(() => {
		const fetchShiftTypes = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getShiftTypes`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch shift types');
				}
				const data = await response.json();
				setShiftTypes(data.shift_types);
			} catch (error) {
				console.error('Error fetching shift types:', error.message);
			}
		};

		fetchShiftTypes();
	}, []);

	// Fetch and format template data only after shiftTypes are loaded
	useEffect(() => {
		const fetchTemplateData = async () => {
			if (!templateId) return;
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getTemplateData?template_id=${templateId}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch template data');
				}
				let data = await response.json();
				// Format times and fill title if missing using shiftTypes lookup
				data = data.map((entry) => {
					const formattedStart = formatTime(entry.start_time);
					const formattedEnd = formatTime(entry.end_time);
					const shift = shiftTypes.find(
						(s) => s.shift_type_id === entry.shift_type_id
					);
					return {
						...entry,
						start_time: formattedStart,
						end_time: formattedEnd,
						title: entry.title || (shift ? shift.name_short : ''),
					};
				});
				setEntries(data);
			} catch (error) {
				console.error('Error fetching template data:', error);
			}
		};

		// Only run if shiftTypes are loaded (to enable title lookup)
		if (shiftTypes.length > 0) {
			fetchTemplateData();
		}
	}, [templateId, shiftTypes]);

	// Submit the data to the backend
	const handleSendData = async () => {
		try {
			const payloadEntries = entries.map(
				({ shift_type_id, title, start_time, end_time, weekday }) => ({
					shift_type_id,
					title,
					start_time,
					end_time,
					weekday,
					template_id: templateId,
				})
			);

			const payload = {
				template_id: templateId,
				entries: payloadEntries,
			};

			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/submitTemplate`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send data');
			}

			alert('Template submitted successfully!');
			setEntries([]);
			setCurrentDay(1);
			setShowSummary(false);
		} catch (error) {
			console.error('Error submitting template:', error.message);
			alert('Failed to submit template. Please try again.');
		}
	};

	// Handler for adding or editing an entry
	const handleAddOrEditEntry = () => {
		const entryToSave = {
			template_id: templateId,
			shift_type_id: newEntry.shift_type_id,
			title: newEntry.title,
			start_time: newEntry.start_time,
			end_time: newEntry.end_time,
			weekday: currentDay,
		};

		if (editingIndex !== null) {
			setEntries((prev) => {
				const updatedEntries = [...prev];
				updatedEntries[editingIndex] = entryToSave;
				return updatedEntries;
			});
		} else {
			setEntries((prev) => [...prev, entryToSave]);
		}

		setNewEntry({ shift_type_id: '', title: '', start_time: '', end_time: '' });
		setEditingIndex(null);
		setShowAddEntryForm(false);
	};

	// Handler to edit an existing entry
	const handleEditEntry = (entry) => {
		const globalIndex = entries.findIndex((e) => e === entry);
		if (globalIndex === -1) return;
		setNewEntry({
			shift_type_id: entry.shift_type_id,
			title: entry.title,
			start_time: entry.start_time,
			end_time: entry.end_time,
		});
		setEditingIndex(globalIndex);
		setShowAddEntryForm(true);
	};

	// Handler to delete an entry
	const handleDeleteEntry = (entry) => {
		const globalIndex = entries.findIndex((e) => e === entry);
		if (globalIndex === -1) return;
		setEntries((prev) => prev.filter((_, i) => i !== globalIndex));
	};

	// Filter entries for the current day
	const currentDayEntries = entries.filter(
		(entry) => entry.weekday === currentDay
	);

	// If summary view is active, render the summary
	if (showSummary) {
		return (
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				<h1 className="text-2xl font-bold">Review Your Template Entries</h1>
				<div className="p-6 max-w-3xl mx-auto rounded-lg shadow-lg">
					<ul className="space-y-2">
						{entries.map((entry, index) => (
							<li
								key={index}
								className="p-4 bg-transparent dark:bg-transparent border border-white rounded">
								<p>
									<strong>Day:</strong>{' '}
									{daysOfWeek.find((day) => day.id === entry.weekday)?.name}
								</p>
								<p>
									<strong>Shift:</strong> {entry.title}
								</p>
								<p>
									<strong>Time:</strong> {entry.start_time} - {entry.end_time}
								</p>
							</li>
						))}
						{entries.length === 0 && (
							<p className="text-gray-600 dark:text-gray-300">
								No entries to submit.
							</p>
						)}
					</ul>
					<div className="mt-6 text-center">
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
							onClick={() => setShowSummary(false)}>
							Back
						</button>
						<button
							className="bg-green-500 text-white px-4 py-2 rounded"
							onClick={handleSendData}>
							Send
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-transparent hover:bg-transparent z-50">
			<div className="bg-transparent hover:bg-transparent rounded-lg p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b pb-4 mb-6">
					<button
						className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
						onClick={onClose}>
						← Back
					</button>
					<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
						Modify Template
					</h2>
				</div>

				{/* Current Day */}
				<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
					Day: {daysOfWeek[currentDay - 1].name}
				</h3>

				{/* Navigation Buttons */}
				<div className="flex space-x-4 mb-6">
					<button
						className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors duration-200 disabled:opacity-50"
						onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}>
						Previous
					</button>
					<button
						className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors duration-200"
						onClick={() => {
							if (currentDay < 7) {
								setCurrentDay((prev) => prev + 1);
							} else {
								setShowSummary(true);
							}
						}}>
						{currentDay === 7 ? 'Continue' : 'Next'}
					</button>
				</div>

				{/* Add Entry Button */}
				<div className="mb-6">
					<button
						className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition-colors duration-200"
						onClick={() => {
							setShowAddEntryForm(true);
							setEditingIndex(null);
							setNewEntry({
								shift_type_id: '',
								title: '',
								start_time: '',
								end_time: '',
							});
						}}>
						Add Entry
					</button>
				</div>

				{/* Add/Edit Entry Form */}
				{showAddEntryForm && (
					<div className="bg-gray-100 dark:bg-gray-700 p-6 rounded mb-6 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
							{editingIndex !== null ? 'Edit Entry' : 'Add Entry'}
						</h3>
						<div className="space-y-4">
							{/* Shift Selector */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
									Shift
								</label>
								<select
									className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-100"
									value={newEntry.shift_type_id}
									onChange={(e) => {
										const selectedShift = shiftTypes.find(
											(shift) => shift.shift_type_id === e.target.value
										);
										if (selectedShift) {
											setNewEntry({
												...newEntry,
												shift_type_id: selectedShift.shift_type_id,
												title: selectedShift.name_short,
											});
										}
									}}>
									<option value="">Select a shift</option>
									{shiftTypes.map((shift) => (
										<option
											key={shift.shift_type_id}
											value={shift.shift_type_id}>
											{shift.name_short}
										</option>
									))}
								</select>
							</div>

							{/* Start Time */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
									Start Time
								</label>
								<input
									type="time"
									className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-100"
									value={newEntry.start_time}
									onChange={(e) =>
										setNewEntry({ ...newEntry, start_time: e.target.value })
									}
								/>
							</div>

							{/* End Time */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
									End Time
								</label>
								<input
									type="time"
									className="w-full p-2 border rounded dark:bg-gray-600 dark:text-gray-100"
									value={newEntry.end_time}
									onChange={(e) =>
										setNewEntry({ ...newEntry, end_time: e.target.value })
									}
								/>
							</div>

							{/* Form Buttons */}
							<div className="flex justify-end space-x-4 mt-4">
								<button
									className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200"
									onClick={handleAddOrEditEntry}
									disabled={
										!newEntry.shift_type_id ||
										!newEntry.start_time ||
										!newEntry.end_time
									}>
									{editingIndex !== null ? 'Save Changes' : 'Add Entry'}
								</button>
								<button
									className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
									onClick={() => {
										setShowAddEntryForm(false);
										setEditingIndex(null);
										setNewEntry({
											shift_type_id: '',
											title: '',
											start_time: '',
											end_time: '',
										});
									}}>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Entries List */}
				<div>
					{currentDayEntries.length === 0 ? (
						<p className="text-gray-600 dark:text-gray-300">
							No entries for today.
						</p>
					) : (
						<ul className="space-y-4">
							{currentDayEntries.map((entry) => (
								<li
									key={`${entry.shift_type_id}-${entry.start_time}-${entry.end_time}`}
									className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded shadow-sm">
									<div>
										<p className="text-gray-800 dark:text-gray-100">
											<strong>Shift:</strong> {entry.title}
										</p>
										<p className="text-gray-700 dark:text-gray-200">
											<strong>Time:</strong> {entry.start_time} -{' '}
											{entry.end_time}
										</p>
									</div>
									<div className="space-x-2">
										<button
											className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200"
											onClick={() => handleEditEntry(entry)}>
											Edit
										</button>
										<button
											className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
											onClick={() => handleDeleteEntry(entry)}>
											Delete
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

export default ModifyTemplate;
