import { useState } from 'react';

function RequestList({ requests, onAction }) {
	if (!requests || requests.length === 0) {
		return <p className="text-gray-500">No pending shift removal requests.</p>;
	}

	return (
		<table className="min-w-full">
			<thead>
				<tr className=" border-b">
					<th className="p-2 border-b border-r">User</th>
					<th className="p-2 border">Shift Type</th>
					<th className="p-2 border">Date</th>
					<th className="p-2 border">Time</th>
					<th className="p-2 border">Schedule Group</th>
					<th className="p-2 border">Requested At</th>
					<th className="p-2 border">Actions</th>
				</tr>
			</thead>
			<tbody>
				{requests.map((req) => {
					const shiftDate = new Date(req.date).toLocaleDateString('en-SE', {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					});

					const shiftStart = new Date(
						`1970-01-01T${req.start_time}`
					).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					});

					const shiftEnd = new Date(
						`1970-01-01T${req.end_time}`
					).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					});

					return (
						<tr
							key={req.request_id}
							className="border-b">
							<td className="p-2 border-b border-r">
								{req.first_name} {req.last_name}
							</td>
							<td className="p-2 border-b border-r">{req.shift_type}</td>
							<td className="p-2 border-b border-r">{shiftDate}</td>
							<td className="p-2 border-b border-r">
								{shiftStart} - {shiftEnd}
							</td>
							<td className="p-2 border-b border-r">{req.schedule_group}</td>
							<td className="p-2 border-b border-r">
								{new Date(req.request_time).toLocaleString()}
							</td>
							<td className="p-2 border space-x-2">
								<button
									onClick={() => onAction(req.request_id, 'approved')}
									className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
									Approve
								</button>
								<button
									onClick={() => onAction(req.request_id, 'rejected')}
									className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
									Reject
								</button>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

export default RequestList;
