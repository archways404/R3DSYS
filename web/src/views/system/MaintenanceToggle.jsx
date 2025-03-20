import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

function MaintenanceToggle({ status, setStatus }) {
	const [updating, setUpdating] = useState(false);

	const toggleMaintenance = async () => {
		if (updating) return;
		setUpdating(true);

		const previousStatus = status.is_maintenance;
		const updatedStatus = !previousStatus;
		setStatus((prev) => ({ ...prev, is_maintenance: updatedStatus }));

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/maintenance`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ is_maintenance: updatedStatus }),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update maintenance mode');
			}
		} catch (error) {
			console.error('Error toggling maintenance mode:', error);
			setStatus((prev) => ({ ...prev, is_maintenance: previousStatus })); // Revert UI
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="flex justify-between items-center w-full">
			<p className="text-lg font-semibold">Maintenance</p>
			<Switch
				checked={status.is_maintenance}
				onCheckedChange={toggleMaintenance}
				disabled={updating}
			/>
		</div>
	);
}

export default MaintenanceToggle;
