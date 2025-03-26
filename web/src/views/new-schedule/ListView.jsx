// ListView.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Temporal } from '@js-temporal/polyfill';

function getShiftColorStyle(shiftType) {
	const base = shiftType.slice(0, -1);
	let hash = 0;
	for (let i = 0; i < base.length; i++) {
		hash = base.charCodeAt(i) + ((hash << 5) - hash);
	}

	const baseHue = Math.abs(hash) % 360;
	const variantChar = shiftType[shiftType.length - 1];
	const variantIndex = variantChar.charCodeAt(0) % 6;
	const hueOffset = (variantIndex - 3) * 10;
	const lightnessOffset = (variantIndex - 3) * 8;

	const h = (baseHue + hueOffset + 360) % 360;
	const s = 70;
	const baseL = 35;
	const l = Math.max(10, Math.min(85, baseL + lightnessOffset));

	return { borderColor: `hsl(${h}, ${s}%, ${l}%)` };
}

function getFirstDayOfMonth(year, month) {
	return Temporal.PlainDate.from({ year, month, day: 1 });
}

function getLastDayOfMonth(year, month) {
	const firstDay = getFirstDayOfMonth(year, month);
	return firstDay.with({ day: firstDay.daysInMonth });
}

function daysBackToMonday(date) {
	return date.dayOfWeek - 1;
}

function daysForwardToSunday(date) {
	return 7 - date.dayOfWeek;
}

function fillCalendarGrid(year, month) {
	const firstDay = getFirstDayOfMonth(year, month);
	const lastDay = getLastDayOfMonth(year, month);

	const daysBack = daysBackToMonday(firstDay);
	const daysForward = daysForwardToSunday(lastDay);

	const prevMonthDate = firstDay.subtract({ months: 1 });
	const lastDayOfPrevMonth = getLastDayOfMonth(prevMonthDate.year, prevMonthDate.month);
	const prevMonth = [];
	for (let i = daysBack - 1; i >= 0; i--) {
		prevMonth.push(lastDayOfPrevMonth.subtract({ days: i }));
	}

	const currMonth = [];
	for (let day = 1; day <= firstDay.daysInMonth; day++) {
		currMonth.push(Temporal.PlainDate.from({ year, month, day }));
	}

	const nextMonthDate = firstDay.add({ months: 1 });
	const nextMonth = [];
	for (let i = 1; i <= daysForward; i++) {
		nextMonth.push(
			Temporal.PlainDate.from({ year: nextMonthDate.year, month: nextMonthDate.month, day: i })
		);
	}

	return [...prevMonth, ...currMonth, ...nextMonth];
}

const ListView = ({ events, year, month }) => {
	const formatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	const days = fillCalendarGrid(year, month);

	return (
		<div className="w-full max-w-[800px] space-y-6">
			{days.map((temporalDate) => {
				const iso = temporalDate.toString(); // e.g., "2025-04-07"
				const jsDate = new Date(`${iso}T00:00:00`);
				const formatted = formatter.format(jsDate); // "Monday, April 7"

				const dayEvents = events[iso] || [];

				return (
					<div
						key={iso}
						className="space-y-2">
						<h2 className="text-lg font-bold text-white flex items-baseline gap-2">
							<span>{formatted}</span>
							<span className="text-sm text-gray-400">({iso})</span>
						</h2>

						{dayEvents.length > 0 ? (
							dayEvents.map((event, idx) => {
								const timeRange = `${event.start_time.slice(0, 5)} – ${event.end_time.slice(0, 5)}`;
								const { borderColor } = getShiftColorStyle(event.shift_type_short);
								const assignedTo = event.assigned_user_first_name
									? `${event.assigned_user_first_name} ${event.assigned_user_last_name}`
									: '-';

								return (
									<Card
										key={idx}
										style={{ border: `1.5px solid ${borderColor}` }}
										className="bg-transparent text-white p-2 shadow-sm">
										<CardContent className="p-2 text-sm flex items-center gap-2 flex-wrap">
											<span className="opacity-80">{timeRange}</span>
											<span className="font-semibold">{event.shift_type_short}</span>
											<span className="ml-auto opacity-90">{assignedTo}</span>
										</CardContent>
									</Card>
								);
							})
						) : (
							<p className="text-sm text-gray-500 italic">No events</p>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default ListView;
