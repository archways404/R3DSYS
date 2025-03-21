/*
const { Temporal } = require('@js-temporal/polyfill');

function getFirstDayOfMonth(year, month) {
	return Temporal.PlainDate.from({ year, month, day: 1 });
}

function getLastDayOfMonth(year, month) {
	const firstDay = getFirstDayOfMonth(year, month);
	return firstDay.with({ day: firstDay.daysInMonth });
}

function getWeekdayName(date) {
	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	return weekdays[date.dayOfWeek - 1]; // Convert 1-7 range to 0-based index
}

function daysBackToMonday(date) {
	return date.dayOfWeek - 1; // Number of days back to reach Monday
}

function daysForwardToSunday(date) {
	return 7 - date.dayOfWeek; // Number of days forward to reach Sunday
}

// Example Usage
const firstDay = getFirstDayOfMonth(2025, 4);
const lastDay = getLastDayOfMonth(2025, 4);

const firstWeekdayName = getWeekdayName(firstDay);
const lastWeekdayName = getWeekdayName(lastDay);

const daysBack = daysBackToMonday(firstDay);
const daysForward = daysForwardToSunday(lastDay);

console.log(`The first day of ${firstDay.month}-${firstDay.year} is a ${firstWeekdayName}`);
console.log(`It is ${daysBack} day(s) away from the previous Monday.`);

console.log(`The last day of ${lastDay.month}-${lastDay.year} is a ${lastWeekdayName}`);
console.log(`It is ${daysForward} day(s) away from the next Sunday.`);
*/

const { Temporal } = require('@js-temporal/polyfill');

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

	return { prevMonth, currMonth, nextMonth };
}

// Example usage
const { prevMonth, currMonth, nextMonth } = fillCalendarGrid(2025, 4);

console.log(
	'Prev Month:',
	prevMonth.map((d) => d.toString())
);
console.log(
	'Current Month:',
	currMonth.map((d) => d.toString())
);
console.log(
	'Next Month:',
	nextMonth.map((d) => d.toString())
);
