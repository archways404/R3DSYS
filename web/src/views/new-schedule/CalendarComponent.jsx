import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Temporal } from '@js-temporal/polyfill';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

	// Previous month
	const prevMonthDate = firstDay.subtract({ months: 1 });
	const lastDayOfPrevMonth = getLastDayOfMonth(prevMonthDate.year, prevMonthDate.month);

	const prevMonth = [];
	for (let i = daysBack - 1; i >= 0; i--) {
		prevMonth.push(lastDayOfPrevMonth.subtract({ days: i }));
	}

	// Current month
	const currMonth = [];
	for (let day = 1; day <= firstDay.daysInMonth; day++) {
		currMonth.push(Temporal.PlainDate.from({ year, month, day }));
	}

	// Next month
	const nextMonthDate = firstDay.add({ months: 1 });
	const nextMonth = [];
	for (let i = 1; i <= daysForward; i++) {
		nextMonth.push(
			Temporal.PlainDate.from({ year: nextMonthDate.year, month: nextMonthDate.month, day: i })
		);
	}

	return [...prevMonth, ...currMonth, ...nextMonth];
}

const Calendar = ({ month, year, events, redDays = [] }) => {
	const days = fillCalendarGrid(year, month);

	const isRedDay = (date) => redDays.includes(date.toString());

	return (
		<div className="w-full max-w-[1300px] mx-auto">
			<div className="grid grid-cols-7 text-center text-white text-sm pb-2">
				{DAYS_OF_WEEK.map((day) => (
					<div
						key={day}
						className="font-semibold p-2">
						{day.slice(0, 3)}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1 border-t border-gray-700">
				{days.map((day) => {
					const isCurrentMonth = day.month === month;
					const red = isRedDay(day);

					return (
						<div
							key={day.toString()}
							className={`flex flex-col p-2 border border-gray-700 relative min-h-[120px] ${
								red
									? 'text-red-500 border-red-500 font-semibold'
									: isCurrentMonth
									? ''
									: 'text-gray-500'
							}`}>
							<div className="text-xs absolute top-1 left-1">{day.day}</div>
							<div className="mt-5 space-y-1 flex-1 overflow-hidden">
								{(events[day.toString()] || []).map((event, index) => (
									<EventCard
										key={index}
										event={event}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

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

	const borderColor = `hsl(${h}, ${s}%, ${l}%)`;

	return { borderColor };
}

const EventCard = ({ event }) => {
	const timeRange = `${event.start_time.slice(0, 5)}–${event.end_time.slice(0, 5)}`;
	const { borderColor } = getShiftColorStyle(event.shift_type_short);

	return (
		<Card
			style={{ border: `1.5px solid ${borderColor}` }}
			className="text-white text-xs rounded-md px-2 py-[2px] shadow-sm bg-transparent">
			<CardContent className="p-0 flex justify-between items-center w-full gap-2">
				<span className="text-[11px] opacity-80 whitespace-nowrap">{timeRange}</span>
				<span className="truncate text-center flex-1 font-semibold">{event.shift_type_short}</span>
			</CardContent>
		</Card>
	);
};

export default Calendar;
