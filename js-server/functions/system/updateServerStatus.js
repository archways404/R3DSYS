async function updateServerStatus(fastify, updates) {
	try {
		// Generate dynamic query
		const fields = Object.keys(updates)
			.filter((key) => updates[key] !== undefined)
			.map((key, index) => `${key} = $${index + 1}`);

		if (fields.length === 0) {
			return { error: 'No valid fields to update' };
		}

		const values = Object.values(updates);

		// Ensure an entry exists before updating
		const { rowCount } = await fastify.pg.query(
			`SELECT 1 FROM server_status LIMIT 1`
		);

		if (rowCount === 0) {
			await fastify.pg.query(`INSERT INTO server_status DEFAULT VALUES`);
		}

		// Update existing row
		const { rows } = await fastify.pg.query(
			`
			UPDATE server_status
			SET ${fields.join(', ')}, last_updated = NOW()
			WHERE id = (SELECT id FROM server_status ORDER BY last_updated DESC LIMIT 1)
			RETURNING *;
			`,
			values
		);

		if (rows.length === 0) {
			return { error: 'No existing server status entry found' };
		}

		return rows[0];
	} catch (error) {
		console.error('Error updating server status:', error);
		return { error: 'Internal Server Error' };
	}
}

module.exports = { updateServerStatus };
