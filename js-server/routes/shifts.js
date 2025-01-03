const { createSchedule } = require('../functions/createSchedule');
const { fetchSchedule } = require('../functions/fetchSchedule');

const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { updateHDCache } = require('../functions/cache');
const { handleHDCache } = require('../functions/cache');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		startRequest(request);
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		endRequest(request);
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.post('/createShiftType', async (request, reply) => {
		const { name_long, name_short } = request.body;

		if (!name_long || !name_short) {
			return reply
				.status(400)
				.send({ error: 'name_long and name_short are required' });
		}

		const client = await fastify.pg.connect();

		try {
			// Check if shift type already exists
			const checkQuery = `
      SELECT * FROM shift_types 
      WHERE name_long = $1 OR name_short = $2;
    `;
			const checkResult = await client.query(checkQuery, [
				name_long,
				name_short,
			]);

			if (checkResult.rows.length > 0) {
				return reply.status(200).send({ message: 'Shift type already exists' });
			}

			// Insert new shift type
			const insertQuery = `
      INSERT INTO shift_types (name_long, name_short) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
			const insertResult = await client.query(insertQuery, [
				name_long,
				name_short,
			]);

			return reply.status(201).send({
				message: 'Shift type created successfully',
				shift_type: insertResult.rows[0],
			});
		} catch (error) {
			console.error('Error creating shift type:', error);
			return reply.status(500).send({ error: 'Failed to create shift type' });
		} finally {
			client.release(); // Release the client back to the pool
		}
	});

	fastify.get('/getShiftTypes', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			// Fetch all shift types
			const query = `SELECT * FROM shift_types;`;
			const result = await client.query(query);

			return reply.status(200).send({
				message: 'Shift types retrieved successfully',
				shift_types: result.rows, // Array of all shift types
			});
		} catch (error) {
			console.error('Error retrieving shift types:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve shift types' });
		} finally {
			client.release(); // Release the client back to the pool
		}
	});

	fastify.post('/createTemplateMeta', async (request, reply) => {
		const { creator_id, private, name } = request.body;

		if (!creator_id || !name) {
			return reply
				.status(400)
				.send({ error: 'creator_id and name are required' });
		}

		const client = await fastify.pg.connect();

		try {
			const query = `
      INSERT INTO template_meta (creator_id, private, name)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

			const result = await client.query(query, [
				creator_id,
				private || false,
				name,
			]);

			return reply.status(201).send({
				message: 'Template meta created successfully',
				template_meta: result.rows[0],
			});
		} catch (error) {
			console.error('Error creating template meta:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to create template meta' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getTemplateMeta', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			const query = `SELECT * FROM template_meta;`;
			const result = await client.query(query);

			return reply.status(200).send({
				message: 'Template meta records retrieved successfully',
				template_meta: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving template meta:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve template meta' });
		} finally {
			client.release();
		}
	});

	fastify.post('/createTemplate', async (request, reply) => {
		const { template_id, shifts } = request.body;

		if (!template_id || !Array.isArray(shifts) || shifts.length === 0) {
			return reply.status(400).send({
				error: 'template_id and an array of shifts are required',
			});
		}

		const client = await fastify.pg.connect();

		try {
			const insertedShifts = [];

			for (const shift of shifts) {
				const { shift_type_id, weekday, start_time, end_time } = shift;

				if (
					!shift_type_id ||
					weekday === undefined ||
					!start_time ||
					!end_time
				) {
					return reply.status(400).send({
						error:
							'shift_type_id, weekday, start_time, and end_time are required for each shift',
					});
				}

				const insertQuery = `
        INSERT INTO templates (template_id, shift_type_id, weekday, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

				const result = await client.query(insertQuery, [
					template_id,
					shift_type_id,
					weekday,
					start_time,
					end_time,
				]);

				insertedShifts.push(result.rows[0]);
			}

			return reply.status(201).send({
				message: 'Template with multiple shifts created successfully',
				shifts: insertedShifts,
			});
		} catch (error) {
			console.error('Error creating template:', error);
			return reply.status(500).send({ error: 'Failed to create template' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getTemplates', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			const query = `
      SELECT t.*, tm.creator_id, tm.private
      FROM templates t
      JOIN template_meta tm ON t.template_id = tm.template_id;
    `;
			const result = await client.query(query);

			return reply.status(200).send({
				message: 'Templates retrieved successfully',
				templates: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving templates:', error);
			return reply.status(500).send({ error: 'Failed to retrieve templates' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
