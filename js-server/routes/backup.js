const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { URL } = require('url');
const { Temporal, Intl } = require('@js-temporal/polyfill');

require('dotenv').config({
	path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

async function routes(fastify, options) {
	/*
	fastify.get('/backup', async (request, reply) => {
		try {
			const backupDir = path.join(__dirname, '..', 'backups');
			if (!fs.existsSync(backupDir)) {
				fs.mkdirSync(backupDir);
			}

			const zonedDateTime = Temporal.Now.zonedDateTimeISO('Europe/Stockholm');
			const timestamp = `${zonedDateTime.toPlainDate()}_${String(zonedDateTime.hour).padStart(
				2,
				'0'
			)}:${String(zonedDateTime.minute).padStart(2, '0')}`;
			const filename = `backup_${timestamp}.dump`;
			const filepath = path.join(backupDir, filename);

			// 🔍 Parse POSTGRES_URI to extract user/pass/db/host
			const dbUrl = new URL(process.env.POSTGRES_URI);
			const user = dbUrl.username;
			const password = dbUrl.password;
			const host = dbUrl.hostname;
			const port = dbUrl.port || 5432;
			const dbName = dbUrl.pathname.replace('/', '');

			const dumpCmd = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -F c ${dbName} -f "${filepath}"`;

			return new Promise((resolve, reject) => {
				exec(dumpCmd, (error, stdout, stderr) => {
					if (error) {
						console.error('Backup error:', stderr);
						reply.status(500).send({ error: 'Failed to create backup' });
						return reject();
					}
					console.log('Backup created:', filepath);
					reply.send({ message: 'Backup created', file: filename });
					resolve();
				});
			});
		} catch (err) {
			console.error(err);
			reply.status(500).send({ error: 'Unexpected error during backup' });
		}
	});
  */

	fastify.get('/backups', async (request, reply) => {
		const backupDir = path.join(__dirname, '..', 'backups');

		if (!fs.existsSync(backupDir)) {
			return reply.send([]);
		}

		const files = fs.readdirSync(backupDir).filter((file) => file.endsWith('.dump'));
		reply.send(files);
	});
}

module.exports = routes;
