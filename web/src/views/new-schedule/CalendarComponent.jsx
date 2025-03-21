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
		<div className="w-full max-w-5xl mx-auto">
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
							className={`p-2 border border-gray-700 min-h-[80px] relative ${
								red
									? 'text-red-500 border-red-500 font-semibold'
									: isCurrentMonth
									? ''
									: 'text-gray-500'
							}`}>
							<div className="text-xs absolute top-1 left-1">{day.day}</div>
							<div className="mt-5 space-y-1">
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

const EventCard = ({ event }) => {
	return (
		<Card className="bg-red-500 text-white text-xs p-1">
			<CardContent className="p-1 text-center">{event.name}</CardContent>
		</Card>
	);
};

export default Calendar;
