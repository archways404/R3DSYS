const { Temporal } = require('@js-temporal/polyfill');
const checkDate = require('./checkDate');

function createRedDays(temporalDate) {
	const year = temporalDate.year;
	const month = temporalDate.month;
	const firstDay = Temporal.PlainDate.from({ year, month, day: 1 });
	const daysInMonth = firstDay.daysInMonth;

	const redDays = [];

	for (let day = 1; day <= daysInMonth; day++) {
		const date = Temporal.PlainDate.from({ year, month, day });
		const redDay = checkDate(date);
		if (redDay) {
			redDays.push(redDay);
		}
	}

	return redDays;
}

module.exports = createRedDays;
