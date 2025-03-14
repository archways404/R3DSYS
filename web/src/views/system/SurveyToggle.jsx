import { Switch } from '@/components/ui/switch';

function SurveyToggle({ status, setStatus }) {
	const toggleSurvey = async () => {
		try {
			const updatedStatus = !status.display_survey;
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/display-survey`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ display_survey: updatedStatus }),
				}
			);

			if (!response.ok) throw new Error('Failed to update survey display');
			const data = await response.json();
			setStatus(data);
		} catch (error) {
			console.error('Error toggling survey display:', error);
		}
	};

	return (
		<div className="flex justify-between items-center w-full">
			<p className="text-lg font-semibold">Display Survey</p>
			<Switch
				checked={status.display_survey}
				onCheckedChange={toggleSurvey}
			/>
		</div>
	);
}

export default SurveyToggle;
