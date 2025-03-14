async function getServerStatus(fastify) {
	try {
		const { rows } = await fastify.pg.query(`
        SELECT is_maintenance, display_survey, start_time, end_time, last_updated
        FROM server_status
        ORDER BY last_updated DESC
        LIMIT 1
      `);

		if (!rows.length) {
			return { error: 'Server status not found' };
		}

		const status = rows[0];

		return {
			api_online: true,
			is_maintenance: status.is_maintenance,
			display_survey: status.display_survey,
			start_time: status.start_time,
			end_time: status.end_time,
			last_updated: status.last_updated,
		};
	} catch (error) {
		console.error('Error fetching server status:', error);
		return { error: 'Internal Server Error' };
	}
}

module.exports = { getServerStatus };
