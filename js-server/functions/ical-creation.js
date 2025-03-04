const fs = require('fs');
const path = require('path');
const ics = require('ics');
const { DateTime } = require('luxon'); // Use luxon for proper timezone handling

async function generateICSFileForUser(userUUID, shifts) {
	try {
		const userFilesPath = path.join(__dirname, '../user_files/');
		if (!fs.existsSync(userFilesPath)) {
			fs.mkdirSync(userFilesPath, { recursive: true });
		}

		const events = shifts
			.map((shift) => {
				try {
					const shiftDate = DateTime.fromJSDate(new Date(shift.date), {
						zone: 'Europe/Stockholm',
					});

					const [startHour, startMinute] = shift.start_time
						.split(':')
						.map(Number);
					const [endHour, endMinute] = shift.end_time.split(':').map(Number);

					const startTime = shiftDate.set({
						hour: startHour,
						minute: startMinute,
					});
					const endTime = shiftDate.set({ hour: endHour, minute: endMinute });

					console.log(
						`🕒 Processing shift ${shift.shift_id} for user ${userUUID}`
					);
					console.log(`   - Shift Date (UTC): ${shift.date}`);
					console.log(
						`   - Converted Shift Date (Swedish Time): ${shiftDate.toISO()}`
					);
					console.log(`   - Start Time (Swedish Time): ${startTime.toISO()}`);
					console.log(`   - End Time (Swedish Time): ${endTime.toISO()}`);

					return {
						start: [
							startTime.year,
							startTime.month,
							startTime.day,
							startTime.hour,
							startTime.minute,
						],
						end: [
							endTime.year,
							endTime.month,
							endTime.day,
							endTime.hour,
							endTime.minute,
						],
						title: shift.name_short,
						description: shift.name_long,
						location: '',
						status: 'CONFIRMED',
						organizer: { name: 'r3dsys', email: 'support@r3dsys.com' },
					};
				} catch (shiftError) {
					console.error(
						`❌ Error processing shift ${shift.shift_id}:`,
						shiftError
					);
					return null;
				}
			})
			.filter(Boolean);

		return new Promise((resolve, reject) => {
			ics.createEvents(events, (error, value) => {
				if (error) {
					console.error(
						`❌ Error creating ICS events for user ${userUUID}:`,
						error
					);
					return reject(error);
				}
				const filePath = path.join(userFilesPath, `${userUUID}.ical`);
				fs.writeFile(filePath, value, (err) => {
					if (err) {
						console.error(
							`❌ Failed to write ICS file for user ${userUUID}:`,
							err
						);
						return reject(err);
					} else {
						console.log(
							`✅ ICS file created for user ${userUUID} at ${filePath}`
						);
						resolve(filePath);
					}
				});
			});
		});
	} catch (globalError) {
		console.error(
			`🚨 Unexpected error in generateICSFileForUser:`,
			globalError
		);
	}
}



async function getAffectedUsers(fastify, group_id) {
	const query = `
    SELECT user_id
    FROM account_schedule_groups
    WHERE group_id = $1
  `;
	const { rows } = await fastify.pg.query(query, [group_id]);
	console.log('User UUIDs in the group:', rows);
	// Transform the array of objects into an array of user_id strings
	const userUUIDs = rows.map((row) => row.user_id);
	return userUUIDs;
}

async function getActiveShiftsForUser(fastify, uuid) {
	const query = `
    SELECT a.*, st.name_short, st.name_long
    FROM active_shifts a
    JOIN shift_types st ON a.shift_type_id = st.shift_type_id
    WHERE a.assigned_to = $1
  `;
	const { rows } = await fastify.pg.query(query, [uuid]);
	console.log('Active shifts for user:', rows);
	return rows;
}

module.exports = {
	getAffectedUsers,
	getActiveShiftsForUser,
	generateICSFileForUser,
};

/*
function groupByUsername(data) {
	return data.reduce((acc, slot) => {
		if (!acc[slot.username]) {
			acc[slot.username] = [];
		}
		acc[slot.username].push(slot);
		return acc;
	}, {});
}

async function generateICSFiles(data) {
	const groupedData = groupByUsername(data);
	const userFilesPath = path.join(__dirname, '../user_files/');

	// Check if the user_files directory exists and create it if not
	if (!fs.existsSync(userFilesPath)) {
		fs.mkdirSync(userFilesPath, { recursive: true });
	}

	for (const [username, slots] of Object.entries(groupedData)) {
		let events = slots.map((slot) => ({
			start: [
				new Date(slot.shift_date).getUTCFullYear(),
				new Date(slot.shift_date).getUTCMonth() + 1,
				new Date(slot.shift_date).getUTCDate(),
				parseInt(slot.start_time.split(':')[0]),
				parseInt(slot.start_time.split(':')[1]),
			],
			end: [
				new Date(slot.shift_date).getUTCFullYear(),
				new Date(slot.shift_date).getUTCMonth() + 1,
				new Date(slot.shift_date).getUTCDate(),
				parseInt(slot.end_time.split(':')[0]),
				parseInt(slot.end_time.split(':')[1]),
			],
			title: slot.shift_type,
			description: `${slot.shift_type}`,
			location: slot.shift_type,
			url: 'https://software404.org', // TODO - FIX THE LINK
			status: 'CONFIRMED',
			organizer: { name: 'mainframeMAU', email: 'mainframeMAU@gmx.com' },
		}));

		ics.createEvents(events, (error, value) => {
			if (error) {
				console.error(`Error creating events for ${username}:`, error);
				return;
			}
			const filePath = path.join(userFilesPath, `${username}.ical`);
			fs.writeFile(filePath, value, (err) => {
				if (err) {
					console.error(`Failed to write ICS file for ${username}:`, err);
				} else {
					console.log(`ICS file created for ${username} at ${filePath}`);
				}
			});
		});
	}
}

async function getAssignedSlots(fastify) {
	const client = await fastify.pg.connect();
	try {
		const result = await client.query('SELECT * FROM get_assigned_slots();');
		return result.rows;
	} catch (error) {
		fastify.log.error(error);
		throw new Error('Database query failed');
	} finally {
		client.release();
	}
}
*/
