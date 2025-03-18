const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { updateHDCache } = require('../functions/cache');
const { handleHDCache } = require('../functions/cache');

async function routes(fastify, options) {
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

	fastify.get('/getActiveShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { shift_type_id, date, assigned_to } = request.query;

		try {
			let query = `
      SELECT * FROM active_shifts
      WHERE 1=1
    `;
			const queryParams = [];

			if (shift_type_id) {
				queryParams.push(shift_type_id);
				query += ` AND shift_type_id = $${queryParams.length}`;
			}

			if (date) {
				queryParams.push(date);
				query += ` AND date = $${queryParams.length}`;
			}

			if (assigned_to) {
				queryParams.push(assigned_to);
				query += ` AND assigned_to = $${queryParams.length}`;
			}

			const result = await client.query(query, queryParams);

			return reply.status(200).send({
				message: 'Active shifts retrieved successfully',
				active_shifts: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving active shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve active shifts' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getUnassignedShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { group_id, shift_type_id, date, user_id } = request.query;

		// group_id and user_id are required.
		if (!group_id) {
			client.release();
			return reply.status(400).send({ error: 'group_id is required' });
		}
		if (!user_id) {
			client.release();
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			// Base query:
			// - Select shifts where no one is assigned.
			// - The shift belongs to the specified group.
			// - And the shift is not already marked as available for the user.
			let query = `
  SELECT 
    ash.shift_id,
    ash.shift_type_id,
    ash.assigned_to,
    ash.start_time,
    ash.end_time,
    ash.date,
    st.name_long,
    st.name_short
  FROM active_shifts as ash
  JOIN shift_types st ON ash.shift_type_id = st.shift_type_id  -- Join with shift_types table
  WHERE ash.assigned_to IS NULL
    AND ash.schedule_group_id = $1
    AND ash.shift_id NOT IN (
      SELECT shift_id FROM available_for_shift WHERE user_id = $2
    )
`;

			const queryParams = [group_id, user_id];

			// Optionally filter by shift_type_id.
			if (shift_type_id) {
				queryParams.push(shift_type_id);
				query += ` AND shift_type_id = $${queryParams.length}`;
			}

			// Optionally filter by date.
			if (date) {
				queryParams.push(date);
				query += ` AND date = $${queryParams.length}`;
			}

			const result = await client.query(query, queryParams);

			return reply.status(200).send({
				message: 'Unassigned shifts retrieved successfully',
				unassigned_shifts: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving unassigned shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve unassigned shifts' });
		} finally {
			client.release();
		}
	});

	fastify.post('/insertAvailableForShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { shift_ids, user_id } = request.body;

		// Validate that shift_ids is a non-empty array and that user_id is provided.
		if (!Array.isArray(shift_ids) || shift_ids.length === 0) {
			client.release();
			return reply
				.status(400)
				.send({ error: 'shift_ids must be a non-empty array' });
		}
		if (!user_id) {
			client.release();
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			// Start the transaction.
			await client.query('BEGIN');

			// Build the bulk insert query.
			// We are going to insert one row per shift id with its associated user_id.
			// For example, if there are two shift_ids, we want to build a query like:
			// INSERT INTO available_for_shift (shift_id, user_id)
			// VALUES ($1, $2), ($3, $4)
			let valuesClause = '';
			const queryParams = [];

			shift_ids.forEach((shiftId, index) => {
				// For each shift, add two parameters: one for shift_id and one for user_id.
				const shiftParamIndex = queryParams.length + 1; // current parameter index for shift_id
				const userParamIndex = queryParams.length + 2; // current parameter index for user_id
				queryParams.push(shiftId, user_id);
				valuesClause += `($${shiftParamIndex}, $${userParamIndex})`;
				if (index < shift_ids.length - 1) {
					valuesClause += ', ';
				}
			});

			const insertQuery = `
      INSERT INTO available_for_shift (shift_id, user_id)
      VALUES ${valuesClause}
    `;

			// Execute the bulk insert.
			await client.query(insertQuery, queryParams);

			// Commit the transaction.
			await client.query('COMMIT');

			return reply
				.status(200)
				.send({ message: 'Available shifts inserted successfully' });
		} catch (error) {
			// If any error occurs, rollback the transaction.
			await client.query('ROLLBACK');
			console.error('Error inserting available shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to insert available shifts' });
		} finally {
			// Always release the client back to the pool.
			client.release();
		}
	});

	fastify.get('/getScheduleForGroup', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { group_id } = request.query;

		// Validate that group_id is provided.
		if (!group_id) {
			client.release();
			return reply.status(400).send({ error: 'group_id is required' });
		}

		try {
			const query = `
      SELECT 
    a.shift_id,
    a.shift_type_id,
    st.name_long AS shift_type_long,
    st.name_short AS shift_type_short,
    a.assigned_to,
    assigned_user.email AS assigned_user_email, -- Include the assigned user's email
    assigned_user.first_name AS assigned_first_name,
    assigned_user.last_name AS assigned_last_name,
    a.start_time,
    a.end_time,
    a.date,
    a.description,
    a.schedule_group_id,

    -- Aggregate available people into a JSON array including their names and emails.
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'user_id', afs.user_id,
                'first_name', available_users.first_name,
                'last_name', available_users.last_name,
                'email', available_users.email
            )
        ) FILTER (WHERE afs.user_id IS NOT NULL),
        '[]'
    ) AS available_people

FROM active_shifts a

-- Join to get shift type names
LEFT JOIN shift_types st
    ON a.shift_type_id = st.shift_type_id

-- Join to get assigned user's details (email and name)
LEFT JOIN account assigned_user
    ON a.assigned_to = assigned_user.user_id

-- Join available users for the shift
LEFT JOIN available_for_shift afs
    ON a.shift_id = afs.shift_id

-- Join to get available users' details
LEFT JOIN account available_users
    ON afs.user_id = available_users.user_id

WHERE a.schedule_group_id = $1

GROUP BY 
    a.shift_id,
    a.shift_type_id,
    st.name_long,
    st.name_short,
    a.assigned_to,
    assigned_user.email,
    assigned_user.first_name,
    assigned_user.last_name,
    a.start_time,
    a.end_time,
    a.date,
    a.description,
    a.schedule_group_id

ORDER BY a.date, a.start_time;
    `;

			const result = await client.query(query, [group_id]);

			return reply.status(200).send({
				message: 'Schedule retrieved successfully',
				schedule: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving schedule:', error);
			return reply.status(500).send({ error: 'Failed to retrieve schedule' });
		} finally {
			client.release();
		}
	});

	fastify.post('/assignShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { assignments } = request.body;

		// Validate that assignments is a non-empty array.
		if (!Array.isArray(assignments) || assignments.length === 0) {
			client.release();
			return reply
				.status(400)
				.send({ error: 'assignments must be a non-empty array' });
		}

		try {
			// Begin a transaction.
			await client.query('BEGIN');

			// Build the bulk update query using a CASE expression.
			// We cast both shift_id and user_id to uuid.
			let query = 'UPDATE active_shifts SET assigned_to = CASE shift_id ';
			const queryParams = [];
			let paramIndex = 1;
			const shiftIds = [];

			// Build the CASE expression.
			for (const assignment of assignments) {
				// Each assignment object must contain shift_id and user_id.
				// Cast both to uuid.
				query += `WHEN $${paramIndex}::uuid THEN $${paramIndex + 1}::uuid `;
				queryParams.push(assignment.shift_id, assignment.user_id);
				shiftIds.push(assignment.shift_id);
				paramIndex += 2;
			}
			query += 'END ';

			// Add a WHERE clause so that only the provided shift_ids are updated.
			query += 'WHERE shift_id IN (';
			// We add a new set of placeholders for the shift IDs and cast them to uuid.
			for (let i = 0; i < shiftIds.length; i++) {
				query += `$${paramIndex + i}::uuid`;
				if (i < shiftIds.length - 1) {
					query += ', ';
				}
				queryParams.push(shiftIds[i]);
			}
			query += ')';

			// Execute the bulk update query.
			await client.query(query, queryParams);

			// Commit the transaction.
			await client.query('COMMIT');

			return reply
				.status(200)
				.send({ message: 'Shifts assigned successfully' });
		} catch (error) {
			// Rollback the transaction if any error occurs.
			await client.query('ROLLBACK');
			console.error('Error assigning shifts:', error);
			return reply.status(500).send({ error: 'Failed to assign shifts' });
		} finally {
			client.release();
		}
	});

	// Request Shift Removal
	fastify.post('/requestShiftRemoval', async (request, reply) => {
		const { shift_id, user_id } = request.body;

		if (!shift_id || !user_id) {
			return reply
				.status(400)
				.send({ error: 'shift_id and user_id are required' });
		}

		const client = await fastify.pg.connect();
		try {
			// Check if the user is actually assigned to this shift
			const checkQuery = `SELECT assigned_to FROM active_shifts WHERE shift_id = $1`;
			const checkResult = await client.query(checkQuery, [shift_id]);

			if (
				checkResult.rows.length === 0 ||
				checkResult.rows[0].assigned_to !== user_id
			) {
				return reply
					.status(403)
					.send({ error: 'User is not assigned to this shift' });
			}

			// Insert removal request
			const insertQuery = `
        INSERT INTO shift_removal_requests (shift_id, user_id, requested_by, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *;
        `;
			const insertResult = await client.query(insertQuery, [
				shift_id,
				user_id,
				user_id,
			]);

			return reply.status(201).send({
				message: 'Shift removal request submitted successfully',
				request: insertResult.rows[0],
			});
		} catch (error) {
			console.error('Error requesting shift removal:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to request shift removal' });
		} finally {
			client.release();
		}
	});

	// Fetch Shift Removal Requests (group specific)
	fastify.get('/getShiftRemovalRequests', async (request, reply) => {
		const { user_id } = request.query;

		if (!user_id) {
			return reply.status(400).send({ error: 'ID is required' });
		}

		const client = await fastify.pg.connect();
		try {
			// Fetch all groups the admin is part of
			const groupQuery = `
        SELECT group_id FROM account_schedule_groups WHERE user_id = $1;
        `;
			const groupResult = await client.query(groupQuery, [user_id]);

			if (groupResult.rows.length === 0) {
				return reply
					.status(403)
					.send({ error: 'Admin is not part of any schedule group' });
			}

			const groupIds = groupResult.rows.map((row) => row.group_id);

			// Fetch all removal requests for users in the same groups as the admin
			const requestQuery = `
        SELECT sr.request_id, sr.shift_id, sr.user_id, a.first_name, a.last_name, sr.request_time, sr.status
        FROM shift_removal_requests sr
        JOIN active_shifts ash ON sr.shift_id = ash.shift_id
        JOIN account a ON sr.user_id = a.user_id
        WHERE ash.schedule_group_id = ANY($1) AND sr.status = 'pending'
        ORDER BY sr.request_time DESC;
        `;

			const requestResult = await client.query(requestQuery, [groupIds]);

			return reply.status(200).send({
				message: 'Pending shift removal requests retrieved successfully',
				removal_requests: requestResult.rows,
			});
		} catch (error) {
			console.error('Error retrieving shift removal requests:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve shift removal requests' });
		} finally {
			client.release();
		}
	});

	// Approve or Reject a Request
	fastify.post('/processShiftRemoval', async (request, reply) => {
		const { request_id, admin_id, action } = request.body;

		if (
			!request_id ||
			!admin_id ||
			!['approved', 'rejected'].includes(action)
		) {
			return reply.status(400).send({
				error:
					'request_id, admin_id, and valid action (approved/rejected) are required',
			});
		}

		const client = await fastify.pg.connect();
		try {
			// Fetch the shift removal request
			const fetchQuery = `SELECT * FROM shift_removal_requests WHERE request_id = $1 AND status = 'pending'`;
			const fetchResult = await client.query(fetchQuery, [request_id]);

			if (fetchResult.rows.length === 0) {
				return reply
					.status(404)
					.send({ error: 'Pending removal request not found' });
			}

			const { shift_id, user_id } = fetchResult.rows[0];

			await client.query('BEGIN');

			if (action === 'approved') {
				// Remove user from the shift
				const updateShiftQuery = `
            UPDATE active_shifts SET assigned_to = NULL WHERE shift_id = $1;
            `;
				await client.query(updateShiftQuery, [shift_id]);
			}

			// Update the removal request status
			const updateRequestQuery = `
        UPDATE shift_removal_requests
        SET status = $1, approved_by = $2, approval_time = NOW()
        WHERE request_id = $3;
        `;
			await client.query(updateRequestQuery, [action, admin_id, request_id]);

			await client.query('COMMIT');

			return reply.status(200).send({
				message: `Shift removal request ${action} successfully`,
			});
		} catch (error) {
			await client.query('ROLLBACK');
			console.error('Error processing shift removal request:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to process shift removal request' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
