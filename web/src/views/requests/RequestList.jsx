import { useState } from 'react';

function RequestList({ requests, onAction }) {
	if (!requests || requests.length === 0) {
		return <p className="text-gray-500">No pending shift removal requests.</p>;
	}

	return (
		<table className="min-w-full border border-gray-200 shadow-lg">
			<thead>
				<tr className="bg-gray-100 border-b">
					<th className="p-2 border">User</th>
					<th className="p-2 border">Requested At</th>
					<th className="p-2 border">Actions</th>
				</tr>
			</thead>
			<tbody>
				{requests.map((req) => (
					<tr
						key={req.request_id}
						className="border-b">
						<td className="p-2 border">
							{req.first_name} {req.last_name}
						</td>
						<td className="p-2 border">
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
				))}
			</tbody>
		</table>
	);
}

export default RequestList;
