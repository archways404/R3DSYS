import { Temporal } from '@js-temporal/polyfill';

import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

import Layout from '../../components/Layout';
import Calendar from './CalendarComponent';
import CalDateComponent from './CalDateComponent';
import FilterComponent from './FilterComponent';
import ViewModeSwitcher from './ViewModeSwitcher';
import ListView from './ListView';

function NewScheduleRenderer() {
	const { user } = useContext(AuthContext);

	const today = new Date();
	const [month, setMonth] = useState(today.getMonth() + 1);
	const [year, setYear] = useState(today.getFullYear());
	const [redDays, setRedDays] = useState([]);
	const [rawShifts, setRawShifts] = useState([]);
	const [transformedEvents, setTransformedEvents] = useState({});
	const [activeGroups, setActiveGroups] = useState(new Set());
	const [showOnlyMine, setShowOnlyMine] = useState(false);
	const [selectedShiftTypes, setSelectedShiftTypes] = useState(new Set());
	const [viewMode, setViewMode] = useState('calendar');

	const availableShiftTypes = Array.from(
		new Map(
			rawShifts.map((s) => [s.shift_type_id, { id: s.shift_type_id, name: s.shift_type_short }])
		).values()
	);

	const filteredEvents = {};

	Object.entries(transformedEvents).forEach(([date, shifts]) => {
		const visibleShifts = shifts.filter((s) => {
			const groupMatch = activeGroups.has(s.schedule_group_id);
			const shiftTypeMatch =
				selectedShiftTypes.size === 0 || selectedShiftTypes.has(s.shift_type_id);
			const mineMatch = !showOnlyMine || s.assigned_user_id === user?.uuid;
			return groupMatch && shiftTypeMatch && mineMatch;
		});
		if (visibleShifts.length > 0) {
			filteredEvents[date] = visibleShifts;
		}
	});

	// Add this to NewScheduleRenderer
	const fetchSchedule = async () => {
		if (!user?.groups || user.groups.length === 0) return;

		try {
			const queryParams = user.groups.map((g) => `group_id=${encodeURIComponent(g.id)}`).join('&');

			const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/schedule?${queryParams}`);
			const data = await res.json();
			setRawShifts(data);

			const grouped = {};

			data.forEach((shift) => {
				const date = Temporal.Instant.from(shift.date)
					.toZonedDateTimeISO('Europe/Stockholm') // change to your timezone if needed
					.toPlainDate()
					.toString();

				if (!grouped[date]) grouped[date] = [];

				grouped[date].push({
					shift_id: shift.shift_id,
					shift_type_id: shift.shift_type_id,
					shift_type_short: shift.shift_type_short,
					shift_type_long: shift.shift_type_long,
					assigned_to: shift.assigned_to,
					assigned_user_id: shift.assigned_user_id,
					assigned_user_first_name: shift.assigned_user_first_name,
					assigned_user_last_name: shift.assigned_user_last_name,
					assigned_user_email: shift.assigned_user_email,
					start_time: shift.start_time,
					end_time: shift.end_time,
					date: shift.date,
					schedule_group_id: shift.schedule_group_id,
				});
			});

			setTransformedEvents(grouped);
		} catch (error) {
			console.error('Failed to fetch schedule:', error);
		}
	};

	useEffect(() => {
		if (user?.groups) {
			setActiveGroups(new Set(user.groups.map((g) => g.id)));
		}
	}, [user?.groups]);

	useEffect(() => {
		const fetchRedDays = async () => {
			try {
				const date = `${year}-${String(month).padStart(2, '0')}-01`;
				const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/redDays?date=${date}`);
				const data = await res.json();
				setRedDays(data);
			} catch (error) {
				console.error('Failed to fetch red days:', error);
			}
		};

		fetchRedDays();
	}, [month, year]);

	useEffect(() => {
		fetchSchedule();
	}, [user?.groups]);

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen space-y-6 pb-8">
				<ViewModeSwitcher
					viewMode={viewMode}
					setViewMode={setViewMode}
				/>
				<CalDateComponent
					month={month}
					year={year}
					setMonth={setMonth}
					setYear={setYear}
				/>
				<FilterComponent
					user={user}
					activeGroups={activeGroups}
					setActiveGroups={setActiveGroups}
					showOnlyMine={showOnlyMine}
					setShowOnlyMine={setShowOnlyMine}
					availableShiftTypes={availableShiftTypes}
					selectedShiftTypes={selectedShiftTypes}
					setSelectedShiftTypes={setSelectedShiftTypes}
				/>
				{viewMode === 'calendar' ? (
					<Calendar
						month={month}
						year={year}
						redDays={redDays}
						events={filteredEvents}
						onScheduleUpdated={fetchSchedule}
					/>
				) : (
					<ListView
						month={month}
						year={year}
						redDays={redDays}
						events={filteredEvents}
						onScheduleUpdated={fetchSchedule}
					/>
				)}
			</div>
		</Layout>
	);
}

export default NewScheduleRenderer;
