async function updateServerStatus(fastify, updates) {
	try {
		// Dynamically generate the update query
		const fields = Object.keys(updates)
			.filter((key) => updates[key] !== undefined)
			.map((key, index) => `${key} = $${index + 1}`);

		if (fields.length === 0) {
			return { error: 'No valid fields to update' };
		}

		const values = Object.values(updates);

		// Update the existing row and return the updated data
		const { rows } = await fastify.pg.query(
			`
			UPDATE server_status
			SET ${fields.join(', ')}, last_updated = NOW()
			WHERE id = (SELECT id FROM server_status LIMIT 1)
			RETURNING *;
			`,
			values
		);

		if (rows.length === 0) {
			return { error: 'No existing server status entry found' };
		}

		return rows[0]; // Return updated row
	} catch (error) {
		console.error('Error updating server status:', error);
		return { error: 'Internal Server Error' };
	}
}

module.exports = { updateServerStatus };
