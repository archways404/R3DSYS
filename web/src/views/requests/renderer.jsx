import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import RequestList from './RequestList';

function RequestRenderer() {
	const { user } = useContext(AuthContext);
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!user) return;

		const fetchRequests = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getShiftRemovalRequests?user_id=${
						user.uuid
					}`
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

	// Handle approve/reject actions
	const handleAction = async (request_id, action) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/processShiftRemoval`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ request_id, admin_id: user.uuid, action }),
				}
			);
			const data = await response.json();

			if (response.ok) {
				setRequests((prev) =>
					prev.filter((req) => req.request_id !== request_id)
				);
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error('Error processing removal request:', error);
			alert('Failed to process the request.');
		}
	};

	if (!user) {
		return (
			<p className="text-center text-gray-500">
				Please log in to view requests.
			</p>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen space-y-6 pb-8">
				<h1 className="text-xl font-bold">Shift Removal Requests</h1>
				{loading ? (
					<p>Loading...</p>
				) : error ? (
					<p className="text-red-500">{error}</p>
				) : (
					<RequestList
						requests={requests}
						onAction={handleAction}
					/>
				)}
			</div>
		</Layout>
	);
}

export default RequestRenderer;
