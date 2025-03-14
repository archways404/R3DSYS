import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MaintenanceToggle from './MaintenanceToggle';
import SurveyToggle from './SurveyToggle';
import TimeSettings from './TimeSettings';

function SystemRenderer() {
	const { user } = useContext(AuthContext);
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch server status
	useEffect(() => {
		async function fetchStatus() {
			try {
				const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/`);
				if (!response.ok) throw new Error('Failed to fetch server status');
				const data = await response.json();
				setStatus(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchStatus();
	}, []);

	if (!user) return null;
	if (error)
		return (
			<Layout>
				<p className="text-red-500">{error}</p>
			</Layout>
		);

	return (
		<Layout>
			<div className="flex flex-col items-center min-h-screen space-y-6 pb-8 w-full max-w-2xl mx-auto">
				<h1 className="text-3xl font-bold">System Settings</h1>

				<Card className="w-full p-4">
					<CardContent className="space-y-6 mt-6">
						{/* Loading Skeleton */}
						{loading ? (
							<>
								<div className="flex items-center justify-between mt-6">
									<Skeleton className="h-6 w-40" />
									<Skeleton className="h-6 w-12 rounded-md" />
								</div>
								<div className="flex items-center justify-between">
									<Skeleton className="h-6 w-40" />
									<Skeleton className="h-6 w-12 rounded-md" />
								</div>
								<div className="space-y-4 pt-2">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-10 w-full rounded-md" />
									<Skeleton className="h-5 w-24" />
									<Skeleton className="h-10 w-full rounded-md" />
									<Skeleton className="h-10 w-full rounded-md" />
								</div>
							</>
						) : (
							<>
								<MaintenanceToggle
									status={status}
									setStatus={setStatus}
								/>
								<SurveyToggle
									status={status}
									setStatus={setStatus}
								/>
								<TimeSettings
									status={status}
									setStatus={setStatus}
								/>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
}

export default SystemRenderer;
