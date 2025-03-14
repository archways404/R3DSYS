import { Switch } from '@/components/ui/switch';

function MaintenanceToggle({ status, setStatus }) {
	const toggleMaintenance = async () => {
		try {
			const updatedStatus = !status.is_maintenance;
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/maintenance`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ is_maintenance: updatedStatus }),
				}
			);

			if (!response.ok) throw new Error('Failed to update maintenance mode');
			const data = await response.json();
			setStatus(data);
		} catch (error) {
			console.error('Error toggling maintenance mode:', error);
		}
	};

	return (
		<div className="flex justify-between items-center w-full">
			<p className="text-lg font-semibold">Maintenance Mode</p>
			<Switch
				checked={status.is_maintenance}
				onCheckedChange={toggleMaintenance}
			/>
		</div>
	);
}

export default MaintenanceToggle;
