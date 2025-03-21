import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import Calendar from './CalendarComponent';
import CalDateComponent from './CalDateComponent';
import { Temporal } from '@js-temporal/polyfill';

function NewScheduleRenderer() {
	const { user } = useContext(AuthContext);

	const today = new Date();
	const [month, setMonth] = useState(today.getMonth() + 1);
	const [year, setYear] = useState(today.getFullYear());
	const [redDays, setRedDays] = useState([]);
	const [rawShifts, setRawShifts] = useState([]);
	const [transformedEvents, setTransformedEvents] = useState({});

	const group_id = '6cd7a46c-ae69-4cac-9b84-e3fff7b0ca97';

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

	// Fetch shifts
	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_BASE_ADDR}/schedule?group_id=${group_id}`);
				const data = await res.json();
				setRawShifts(data);

				const grouped = {};

				data.forEach((shift) => {
					const dateOnly = shift.date.split('T')[0]; // Remove time and timezone
					const date = Temporal.PlainDate.from(dateOnly).toString();

					if (!grouped[date]) grouped[date] = [];

					grouped[date].push({
						shift_id: shift.shift_id,
						shift_type_id: shift.shift_type_id,
						shift_type_short: shift.shift_type_short,
						shift_type_long: shift.shift_type_long,
						assigned_to: shift.assigned_to,
						assigned_user_id: shift.assigned_user_id,
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

		fetchSchedule();
	}, [group_id]);

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen space-y-6 pb-8">
				<CalDateComponent
					month={month}
					year={year}
					setMonth={setMonth}
					setYear={setYear}
				/>
				<Calendar
					month={month}
					year={year}
					redDays={redDays}
					events={transformedEvents}
				/>
			</div>
		</Layout>
	);
}

export default NewScheduleRenderer;
