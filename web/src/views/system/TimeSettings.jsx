import { useState } from 'react';
import { Button } from '@/components/ui/button';

function TimeSettings({ status, setStatus }) {
	const [startTime, setStartTime] = useState(status.start_time || '');
	const [endTime, setEndTime] = useState(status.end_time || '');
	const [updating, setUpdating] = useState(false);

	const updateTimes = async () => {
		if (updating) return;
		setUpdating(true);

		const previousStatus = {
			start_time: status.start_time,
			end_time: status.end_time,
		};
		setStatus((prev) => ({
			...prev,
			start_time: startTime,
			end_time: endTime,
		}));

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

			if (!response.ok) {
				throw new Error('Failed to update times');
			}
		} catch (error) {
			console.error('Error updating times:', error);
			setStatus((prev) => ({
				...prev,
				start_time: previousStatus.start_time,
				end_time: previousStatus.end_time,
			})); // Revert UI
		} finally {
			setUpdating(false);
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
					disabled={updating}
				/>
			</div>
			<div className="flex flex-col space-y-2">
				<label className="text-sm">End Time</label>
				<input
					type="datetime-local"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
					className="border p-2 rounded-md w-full"
					disabled={updating}
				/>
			</div>
			<Button
				onClick={updateTimes}
				className="bg-blue-500 text-white"
				disabled={updating}>
				Update
			</Button>
		</div>
	);
}

export default TimeSettings;
