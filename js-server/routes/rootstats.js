const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { URL } = require('url');
const { Temporal, Intl } = require('@js-temporal/polyfill');

require('dotenv').config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

async function routes(fastify, options) {
	fastify.get('/d-summary', async (request, reply) => {
		try {
			const { rows } = await fastify.pg.query(`
				SELECT 
					account_count,
					active_shift_count,
					archived_shift_count,
					auth_log_count
				FROM daily_stats
				ORDER BY stat_date DESC
				LIMIT 1;
			`);

			if (rows.length === 0) {
				return reply.status(404).send({ error: 'No stats available' });
			}

			const stat = rows[0];
			const summary = {
				Accounts: stat.account_count,
				Shifts: stat.active_shift_count + stat.archived_shift_count,
				Logins: stat.auth_log_count,
			};

			reply.send(summary);
		} catch (err) {
			console.error('Error fetching daily stats:', err);
			reply.status(500).send({ error: 'Failed to retrieve stats' });
		}
	});
}

module.exports = routes;
