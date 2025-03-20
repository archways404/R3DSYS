import { useState } from 'react';
import { BsMicrosoftTeams } from 'react-icons/bs';

import { Check } from 'lucide-react';
import { X } from 'lucide-react';

function RequestList({ requests, onAction }) {
	if (!requests || requests.length === 0) {
		return <p className="text-gray-500">No pending shift removal requests.</p>;
	}

	return (
		<table className="min-w-full">
			<thead>
				<tr className="border-b">
					<th className="p-2 border-b border-r">Name</th>
					<th className="p-2 border-b border-r">Shift Type</th>
					<th className="p-2 border-b border-r">Date</th>
					<th className="p-2 border-b border-r">Time</th>
					<th className="p-2 border-b">Actions</th>
					<th className="p-2 border-b border-r"></th>
					<th className="p-2 border-b border-r">Schedule Group</th>
					<th className="p-2 border-b">Requested At</th>
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

					const shiftStart = new Date(`1970-01-01T${req.start_time}`).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					});

					const shiftEnd = new Date(`1970-01-01T${req.end_time}`).toLocaleTimeString([], {
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
							<td className="p-2 border-b space-x-2">
								<button
									onClick={() => onAction(req.request_id, 'approved')}
									className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
									<Check
										size={20}
										className=""
									/>
								</button>
								<button
									onClick={() => onAction(req.request_id, 'rejected')}
									className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
									<X
										size={20}
										className=""
									/>
								</button>
							</td>
							<td className="p-2 text-center border-b border-r">
								<button
									className={`flex items-center space-x-2 px-3 py-1 border 
        rounded ${
					req.teams_email
						? 'text-blue-600 hover:bg-blue-100 border-blue-600'
						: 'text-gray-400 cursor-not-allowed border-gray-400'
				}`}
									disabled={!req.teams_email}
									onClick={() => {
										if (req.teams_email) {
											window.open(
												`https://teams.microsoft.com/l/chat/0/0?users=${req.teams_email}`,
												'_blank',
												'noopener,noreferrer'
											);
										}
									}}>
									<BsMicrosoftTeams
										size={20}
										className={req.teams_email ? 'text-blue-600' : 'text-gray-400'}
									/>
								</button>
							</td>
							<td className="p-2 border-b border-r">{req.schedule_group}</td>
							<td className="p-2 border-b border-r">
								{new Date(req.request_time).toLocaleString()}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

export default RequestList;
