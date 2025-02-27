import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import CalendarView from '../../temp/CalendarView';

function Schedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [scheduleGroups, setScheduleGroups] = useState([]);
	const [selectedGroup, setSelectedGroup] = useState(
		() => localStorage.getItem('selectedGroup') || ''
	);
	const [events, setEvents] = useState([]);

	useEffect(() => {
		if (user) {
			fetchScheduleGroups();
		}
	}, [user]);

	useEffect(() => {
		// Fetch schedule only if a valid group is selected
		if (selectedGroup) {
			fetchActiveShifts(selectedGroup);
		} else {
			setEvents([]); // Clear events if no group is selected
		}
	}, [selectedGroup]);

	const fetchScheduleGroups = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR +
					'/getScheduleGroups?user_id=' +
					user.uuid
			);
			const data = await response.json();
			setScheduleGroups(data);
		} catch (error) {
			console.error('Error fetching groups:', error);
		}
	};

	const fetchActiveShifts = async (group_id) => {
		try {
			const response = await fetch(
				`${
					import.meta.env.VITE_BASE_ADDR
				}/getActiveShiftsForGroup?group_id=${group_id}`
			);
			const data = await response.json();
			setEvents(data);
			//const formattedEvents = transformShiftData(data);
			//setEvents(formattedEvents);
		} catch (error) {
			console.error('Error fetching active shifts:', error);
		}
	};

	// Handle dropdown selection and save to localStorage
	const handleGroupChange = (e) => {
		const value = e.target.value;
		setSelectedGroup(value);
		localStorage.setItem('selectedGroup', value); // Save to localStorage
	};

	// Central events state
	/*
	const [events, setEvents] = useState([
		{
			id: '1',
			title: 'Lunch',
			start: '2025-01-15T12:00:00',
			end: '2025-01-15T13:30:00',
		},
		{
			id: '2',
			title: 'Coffee Break',
			start: '2025-01-16T15:00:00',
			end: '2025-01-16T15:30:00',
		},
	]);
	*/

	// Event Handlers (create, update, delete)
	const handleEventSubmit = (event) => {
		if (events.find((e) => e.id === event.id)) {
			// Update event
			setEvents(events.map((e) => (e.id === event.id ? event : e)));
		} else {
			// Add new event
			setEvents([...events, event]);
		}
	};

	const handleDeleteEvent = (eventId) => {
		setEvents(events.filter((e) => e.id !== eventId));
	};

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				{/* Add some margin to the left and right */}
				{/* Dropdown to select a schedule group */}
				<div className="mb-4">
					<label
						htmlFor="scheduleGroup"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Select Schedule Group
					</label>
					<select
						id="scheduleGroup"
						value={selectedGroup}
						onChange={handleGroupChange} // Handle changes
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200">
						<option value="">Select a Group</option>
						{scheduleGroups.map((group) => (
							<option
								key={group.group_id}
								value={group.group_id}>
								{group.name}
							</option>
						))}
					</select>
				</div>
				<div className="w-full max-w-6xl px-4 mt-4">
					{/* Full height minus header/footer */}
					<div className="h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
						<CalendarView
							events={events}
							onEventSubmit={handleEventSubmit}
							onDeleteEvent={handleDeleteEvent}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default Schedule;

/*
import { useState, useEffect, useContext } from 'react';
import DayColumn from '../components/DayColumn';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

function Schedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [scheduleData, setScheduleData] = useState([]);
	const [showUserSchedule, setShowUserSchedule] = useState(false);

	const fetchScheduleData = async (uuid = null) => {
		try {
			let url = import.meta.env.VITE_BASE_ADDR + '/viewSchedule';
			if (uuid) {
				url += `?uuid=${uuid}`;
				console.log(`Fetching user's schedule with uuid: ${uuid}`);
			} else {
				console.log('Fetching all schedules');
			}
			const response = await fetch(url);
			const data = await response.json();

			const transformedData = data.map((entry) => ({
				uid: entry.uuid,
				moment: `${entry.first_name} ${entry.last_name}`,
				location: entry.shift_type,
				date: entry.shift_date.split('T')[0],
				start_time: entry.start_time,
				end_time: entry.end_time,
				hours: calculateHours(entry.start_time, entry.end_time),
			}));

			setScheduleData(transformedData);
		} catch (error) {
			console.error('Error fetching schedule data:', error);
		}
	};

	useEffect(() => {
		if (showUserSchedule) {
			fetchScheduleData(user.uuid);
		} else {
			fetchScheduleData();
		}
	}, [showUserSchedule, user.uuid]);

	const calculateHours = (startTime, endTime) => {
		const start = new Date(`1970-01-01T${startTime}Z`);
		const end = new Date(`1970-01-01T${endTime}Z`);
		const diffInMs = end - start;
		const hours = diffInMs / (1000 * 60 * 60);
		return hours;
	};

	// Get the dates for the current month
	const getMonthDates = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();

		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		const dates = [];

		// Get the first Monday on or before the first day of the month
		const startDay = new Date(firstDayOfMonth);
		startDay.setDate(startDay.getDate() - ((startDay.getDay() + 6) % 7));

		// Get the last Sunday on or after the last day of the month
		const endDay = new Date(lastDayOfMonth);
		endDay.setDate(endDay.getDate() + ((7 - endDay.getDay()) % 7));

		// Generate all dates between startDay and endDay
		for (
			let day = new Date(startDay);
			day <= endDay;
			day.setDate(day.getDate() + 1)
		) {
			dates.push(new Date(day).toISOString().split('T')[0]);
		}

		return dates;
	};

	// Group data by date
	const groupedData = scheduleData.reduce((acc, entry) => {
		const date = entry.date;
		if (!acc[date]) acc[date] = [];
		acc[date].push(entry);
		return acc;
	}, {});

	// Get the dates for the current month
	const datesOfMonth = getMonthDates(currentMonth);

	// Handle month navigation
	const handlePreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	const handleNextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		);
	};

	return (
		<Layout>
			<div className="flex justify-center items-center mb-8 mt-4 space-x-6">
				<button
					onClick={handlePreviousMonth}
					className="p-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700">
					Previous
				</button>
				<div className="text-center">
					<div className="text-2xl font-bold text-white">
						{currentMonth.getFullYear()}
					</div>
					<div className="text-lg text-gray-300">
						{currentMonth.toLocaleString('default', { month: 'long' })}
					</div>
				</div>
				<button
					onClick={handleNextMonth}
					className="p-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700">
					Next
				</button>
				
				<button
					onClick={() => setShowUserSchedule(!showUserSchedule)}
					className="p-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700">
					{showUserSchedule ? 'Show All Schedules' : 'Show My Schedule'}
				</button>
			</div>
			<div className="container mx-auto p-4 max-w-screen-xl">
				<div className="grid grid-cols-7 gap-4 bg-gray-800 rounded-lg shadow-lg p-6">
					{datesOfMonth.map((date, index) => (
						<DayColumn
							key={index}
							date={date}
							entries={groupedData[date] || []}
						/>
					))}
				</div>
			</div>
		</Layout>
	);
}

export default Schedule;
*/
