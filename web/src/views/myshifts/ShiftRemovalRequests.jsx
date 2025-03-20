import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ShiftRemovalRequests = () => {
	const { user } = useContext(AuthContext);
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!user) return;

		const fetchRequests = async () => {
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getUserShiftRemovalRequests?user_id=${user.uuid}`
				);
				const data = await response.json();

				if (response.ok) {
					setRequests(data.removal_requests);
				} else {
					setError(data.error || 'Failed to fetch removal requests');
				}
			} catch (error) {
				console.error('Error fetching removal requests:', error);
				setError('Network error while fetching removal requests.');
			} finally {
				setLoading(false);
			}
		};

		fetchRequests();
	}, [user]);

	if (!user)
		return (
			<p className="text-center text-gray-500">
				Please log in to view your removal requests.
			</p>
		);

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold text-center">Requests</h2>

			{loading && <p className="text-center">Loading...</p>}
			{error && <p className="text-center text-red-500">{error}</p>}

			{requests.length > 0 ? (
				<table className="min-w-full mt-4">
					<thead>
						<tr className="border-b">
							<th className="p-2 border-b border-r">Shift</th>
							<th className="p-2 border-b border-r">Date</th>
							<th className="p-2 border-b border-r">Time</th>
							<th className="p-2 border-b border-r">Status</th>
							<th className="p-2 border-b border-r">Requested</th>
							<th className="p-2 border-b">Processed</th>
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
									<td className="p-2 border-b border-r">{req.shift_type}</td>
									<td className="p-2 border-b border-r">{shiftDate}</td>
									<td className="p-2 border-b border-r">
										{shiftStart} - {shiftEnd}
									</td>
									<td className="p-2 border">
										<span
											className={`px-3 py-1 rounded ${
												req.status === 'pending'
													? 'bg-yellow-500 text-white'
													: req.status === 'approved'
													? 'bg-green-500 text-white'
													: 'bg-red-500 text-white'
											}`}>
											{req.status}
										</span>
									</td>
									<td className="p-2 border">
										{new Date(req.request_time).toLocaleString()}
									</td>
									<td className="p-2 border">
										{req.approval_time
											? new Date(req.approval_time).toLocaleString()
											: '-'}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			) : (
				<p className="text-gray-500 text-center mt-4">
					No recent removal requests.
				</p>
			)}
		</div>
	);
};

export default ShiftRemovalRequests;
