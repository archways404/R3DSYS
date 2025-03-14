import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

function SystemRenderer() {
	const { user } = useContext(AuthContext);
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');

	// Fetch server status
	useEffect(() => {
		async function fetchStatus() {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/status`
				);
				if (!response.ok) throw new Error('Failed to fetch server status');
				const data = await response.json();
				setStatus(data);
				setStartTime(data.start_time || '');
				setEndTime(data.end_time || '');
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchStatus();
	}, []);

	if (!user) return null;
	if (loading)
		return (
			<Layout>
				<p>Loading server status...</p>
			</Layout>
		);
	if (error)
		return (
			<Layout>
				<p className="text-red-500">{error}</p>
			</Layout>
		);

	// Toggle Maintenance Mode
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

	// Toggle Survey Display
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

	// Update Start and End Times
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
		<Layout>
			<div className="flex flex-col items-center min-h-screen space-y-6 pb-8 w-full max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold">System Settings</h1>

				<Card className="w-full p-4">
					<CardContent className="space-y-6">
						{/* Maintenance Mode Toggle */}
						<div className="flex items-center justify-between mt-6">
							<Label className="text-lg">Maintenance Mode</Label>
							<Switch
								checked={status.is_maintenance}
								onCheckedChange={toggleMaintenance}
							/>
						</div>

						{/* Survey Display Toggle */}
						<div className="flex items-center justify-between">
							<Label className="text-lg">Display Survey</Label>
							<Switch
								checked={status.display_survey}
								onCheckedChange={toggleSurvey}
							/>
						</div>

						{/* Maintenance Timing */}
						<div className="space-y-4 pt-2">
							<div className="flex flex-col space-y-2">
								<Label className="text-sm">Start Time</Label>
								<input
									type="datetime-local"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									className="border p-2 rounded-md w-full"
								/>
							</div>
							<div className="flex flex-col space-y-2">
								<Label className="text-sm">End Time</Label>
								<input
									type="datetime-local"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									className="border p-2 rounded-md w-full"
								/>
							</div>
							<Button
								onClick={updateTimes}
								className="bg-blue-500 text-white w-full">
								Update Times
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}

export default SystemRenderer;
