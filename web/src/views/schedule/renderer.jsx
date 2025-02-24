import { useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import Layout from '../../components/Layout';
import CalendarView from './CalendarView';

function ScheduleRenderer() {
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	console.log('user', user);

	const allCategories = ['necessary', 'preferences', 'analytics'];
	const permissionsObject = allCategories.reduce((acc, category) => {
		acc[category] = consent?.acceptedCategories?.includes(category) ?? false;
		return acc;
	}, {});

	if (!user) {
		return null;
	}

	const scheduleGroups = user.groups ?? []; // Use groups from user object

	// Set default selected group from cookies/localStorage
	const [selectedGroup, setSelectedGroup] = useState(() => {
		if (permissionsObject.preferences) {
			return Cookies.get('selectedGroup') || '';
		}
		return localStorage.getItem('selectedGroup') || '';
	});
	const [events, setEvents] = useState([]);
	const [showAssignedOnly, setShowAssignedOnly] = useState(false); // New state for filtering

	useEffect(() => {
		if (selectedGroup) {
			fetchActiveShifts(selectedGroup);
		} else {
			setEvents([]);
		}
	}, [selectedGroup]);

	const fetchActiveShifts = async (group_id) => {
		try {
			const response = await fetch(
				`${
					import.meta.env.VITE_BASE_ADDR
				}/getActiveShiftsForGroup?group_id=${group_id}`
			);
			const data = await response.json();
			setEvents(data);
			console.log('shift: ', data);
		} catch (error) {
			console.error('Error fetching active shifts:', error);
		}
	};

	const handleGroupChange = (groupId) => {
		setSelectedGroup(groupId);

		if (permissionsObject.preferences) {
			Cookies.set('selectedGroup', groupId, { expires: 30 });
		} else {
			localStorage.setItem('selectedGroup', groupId);
		}
	};

	// Toggle assigned-only filter
	const toggleAssignedFilter = () => {
		setShowAssignedOnly((prev) => !prev);
	};

	// Filtered events (if enabled, only show assigned ones)
	const filteredEvents = showAssignedOnly
		? events.filter((event) => event.extendedProps.assignedTo === user.uuid)
		: events;

	const handleEventSubmit = (event) => {
		if (events.find((e) => e.id === event.id)) {
			setEvents(events.map((e) => (e.id === event.id ? event : e)));
		} else {
			setEvents([...events, event]);
		}
	};

	const handleDeleteEvent = (eventId) => {
		setEvents(events.filter((e) => e.id !== eventId));
	};

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				{/* Row of buttons instead of dropdown */}
				<div className="flex flex-wrap gap-2">
					{scheduleGroups.map((group) => (
						<button
							key={group.id}
							onClick={() => handleGroupChange(group.id)}
							className={`px-4 py-2 rounded-md font-medium transition-all
								${
									selectedGroup === group.id
										? 'bg-red-500 text-white'
										: 'border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white'
								}
							`}>
							{group.name}
						</button>
					))}
				</div>

				{/* Toggle Button for Assigned Shifts */}
				<div className="mt-4">
					<button
						onClick={toggleAssignedFilter}
						className={`px-4 py-2 rounded-md font-medium transition-all ${
							showAssignedOnly
								? 'bg-blue-500 text-white'
								: 'border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white'
						}`}>
						{showAssignedOnly ? 'Show All Shifts' : 'Show Only My Shifts'}
					</button>
				</div>

				{/* Calendar View */}
				<div className="w-full max-w-6xl px-4 mt-4">
					<div className="h-[calc(100vh-200px)] overflow-hidden rounded-lg shadow-md">
						<CalendarView
							events={filteredEvents} // Pass filtered events
							onEventSubmit={handleEventSubmit}
							onDeleteEvent={handleDeleteEvent}
						/>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default ScheduleRenderer;
