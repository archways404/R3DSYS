import { useState } from 'react';
import { Button } from '@/components/ui/button';

function TimeSettings({ status, setStatus }) {
	const [startTime, setStartTime] = useState(status.start_time || '');
	const [endTime, setEndTime] = useState(status.end_time || '');

	const updateTimes = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/times`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						start_time: startTime || null,
						end_time: endTime || null,
					}),
				}
			);

			if (!response.ok) throw new Error('Failed to update times');
			const data = await response.json();
			setStatus(data);
		} catch (error) {
			console.error('Error updating times:', error);
		}
	};

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex flex-col space-y-2">
				<label className="text-sm">Start Time</label>
				<input
					type="datetime-local"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
					className="border p-2 rounded-md w-full"
				/>
			</div>
			<div className="flex flex-col space-y-2">
				<label className="text-sm">End Time</label>
				<input
					type="datetime-local"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
					className="border p-2 rounded-md w-full"
				/>
			</div>
			<Button
				onClick={updateTimes}
				className="bg-blue-500 text-white">
				Update Times
			</Button>
		</div>
	);
}

export default TimeSettings;
