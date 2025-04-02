const path = require('path');
const fs = require('fs');
const { Temporal } = require('@js-temporal/polyfill');

const locationMap = {
	HDORKBIBA: '9957ee98-276f-4bd0-b0f7-3135fa196f88',
	HDORKBIBB: '67ff8cc4-95e2-43fa-b473-1854ffb9a831',
	HDHSBIB: '4ebae2c6-6776-4035-8c9e-b510a5e338d7',
	HDTELEA: '44311a78-ec8c-4de7-824f-ba0f93a907b6',
	HDTEK: '6d9c28bd-45b1-4a55-baaa-e94f21f27074',
	DIGIM: 'f8806e93-4aaa-4160-8ebf-4e25af51f38b',
};

function parseIcsDate(icsDateStr) {
	try {
		const dt = Temporal.Instant.from(icsDateStr);
		const zoned = dt.toZonedDateTimeISO('Europe/Stockholm');
		return {
			date: zoned.toPlainDate().toString(), // YYYY-MM-DD
			time: zoned.toPlainTime().toString({ smallestUnit: 'minute' }), // HH:mm
		};
	} catch (err) {
		console.warn(`Failed to parse date: ${icsDateStr}`, err);
		return {};
	}
}

function parseIcsFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const normalized = content.replace(/\r\n/g, '\n'); // normalize line endings
	const events = normalized.split('BEGIN:VEVENT').slice(1); // skip calendar header

	const parsedEvents = [];

	for (const eventRaw of events) {
		const lines = eventRaw.split('\n').map((l) => l.trim());

		const get = (key) =>
			lines
				.find((l) => l.startsWith(key))
				?.split(':')
				.slice(1)
				.join(':')
				.trim() ?? '';

		const dtStartRaw = get('DTSTART');
		const dtEndRaw = get('DTEND');
		const dtStampRaw = get('DTSTAMP');
		const location = get('LOCATION');
		const summary = get('SUMMARY');

		// Normalize location name
		let normalizedLocation = location.toUpperCase().replace(/\s/g, '');

		// Custom mappings
		if (normalizedLocation.startsWith('DIGIM')) {
			normalizedLocation = 'DIGIM';
		} else if (normalizedLocation === 'TEKNIKUTLÅNING' || normalizedLocation === 'TEKNIKUTLANING') {
			normalizedLocation = 'HDTEK';
		}

		// Get UUID or fallback to raw
		const locationId = locationMap[normalizedLocation] ?? null;

		if (!dtStartRaw || !dtEndRaw || !summary) continue;

		const { date, time: start } = parseIcsDate(dtStartRaw);
		const { time: end } = parseIcsDate(dtEndRaw);
		const { date: tsDate, time: tsTime } = parseIcsDate(dtStampRaw);
		const timestamp = tsDate && tsTime ? `${tsDate} ${tsTime}` : null;

		// Try multiple ways to extract moment
		const momentMatch = summary.match(/Moment:\s*(.*?)\s*Aktivitetstyp:/i);
		const momentRaw = momentMatch?.[1]?.trim() ?? '';

		// fallback if no match and "Moment:" exists
		const fallbackMomentMatch = summary.includes('Moment:')
			? summary.split('Moment:')[1].split('Aktivitetstyp:')[0].trim()
			: '';
		const finalMoment = momentRaw || fallbackMomentMatch;

		const moments = finalMoment
			.split(',')
			.map((m) => m.trim())
			.filter(Boolean);

		if (!moments.length) {
			// If no people, still add a single row (e.g., "Ledig")
			parsedEvents.push({
				date,
				start,
				end,
				timestamp,
				locationId,
				moment: finalMoment || summary, // fallback
			});
			continue;
		}

		for (const person of moments) {
			parsedEvents.push({
				date,
				start,
				end,
				timestamp,
				locationId,
				moment: person,
			});
		}
	}

	return parsedEvents;
}
async function routes(fastify, options) {
	fastify.get('/tmp', async (request, reply) => {
		const filePath = path.join(__dirname, 'SchemaICAL.ics');
		if (!fs.existsSync(filePath)) {
			return reply.status(404).send({ error: 'File not found' });
		}

		const data = parseIcsFile(filePath);
		return reply.send(data);
	});

	fastify.get('/tmp1', async (request, reply) => {
		const client = await fastify.pg.connect();
		const filePath = path.join(__dirname, 'SchemaICAL.ics');

		try {
			if (!fs.existsSync(filePath)) {
				return reply.status(404).send({ error: 'File not found' });
			}

			const shifts = parseIcsFile(filePath);

			for (const shift of shifts) {
				const { date, start, end, locationId, moment } = shift;

				if (!locationId || !date || !start || !end) {
					console.warn(`Skipping invalid shift:`, shift);
					continue;
				}

				const scheduleGroupId =
					locationId === 'f8806e93-4aaa-4160-8ebf-4e25af51f38b'
						? '93161ff9-b250-4697-8d23-85e51c3abdb5'
						: 'b2325149-ada1-4882-bf61-c0e27f87b8d7';

				const query = `
        INSERT INTO active_shifts (
          shift_type_id, assigned_to, start_time, end_time, date, description, schedule_group_id
        )
        VALUES ($1, NULL, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      `;

				const values = [locationId, start, end, date, moment || null, scheduleGroupId];

				await client.query(query, values);
			}

			return reply.send({ success: true, inserted: shifts.length });
		} catch (err) {
			console.error('Error inserting shifts:', err);
			return reply.status(500).send({ error: 'Failed to insert shifts' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
