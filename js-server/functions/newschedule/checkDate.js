const { Temporal } = require('@js-temporal/polyfill');
const Holidays = require('date-holidays');
const hd = new Holidays('SE');

function checkDate(temporalDate) {
	const dateString = temporalDate.toString();
	const holiday = hd.isHoliday(dateString);

	if (!holiday) {
		return null; // Not a holiday
	}

	if (Array.isArray(holiday)) {
		const hasSpecialHoliday = holiday.some(
			(h) => h.type === 'public' || h.type === 'bank' || h.type === 'school'
		);
		if (hasSpecialHoliday) {
			console.log(`Detected holiday: ${dateString} - ${holiday.map((h) => h.name).join(', ')}`);
			return temporalDate;
		}
		return null;
	}

	const isSpecialHoliday =
		holiday.type === 'public' || holiday.type === 'bank' || holiday.type === 'school';

	if (isSpecialHoliday) {
		console.log(`Detected holiday: ${dateString} - ${holiday.name}`);
		return temporalDate;
	}

	return null;
}

module.exports = checkDate;
