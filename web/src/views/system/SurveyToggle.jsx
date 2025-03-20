import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

function SurveyToggle({ status, setStatus }) {
	const [updating, setUpdating] = useState(false);

	const toggleSurvey = async () => {
		if (updating) return;
		setUpdating(true);

		const previousStatus = status.display_survey;
		const updatedStatus = !previousStatus;
		setStatus((prev) => ({ ...prev, display_survey: updatedStatus }));

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/display-survey`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ display_survey: updatedStatus }),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update survey display');
			}
		} catch (error) {
			console.error('Error toggling survey display:', error);
			setStatus((prev) => ({ ...prev, display_survey: previousStatus })); // Revert UI
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="flex justify-between items-center w-full">
			<p className="text-lg font-semibold">Display Survey</p>
			<Switch
				checked={status.display_survey}
				onCheckedChange={toggleSurvey}
				disabled={updating}
			/>
		</div>
	);
}

export default SurveyToggle;
