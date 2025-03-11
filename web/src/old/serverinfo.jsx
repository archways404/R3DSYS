import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../components/Layout';

// ✅ Format uptime (rounded)
const formatUptime = (uptimeSeconds) => {
	const seconds = Math.floor(uptimeSeconds);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ${minutes % 60}m`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ${hours % 24}h`;
	const weeks = Math.floor(days / 7);
	return `${weeks}w ${days % 7}d`;
};

// ✅ Get color for CPU & Memory usage
const getUsageColor = (value) => {
	if (value < 40) return 'text-green-500'; // Green (low)
	if (value < 70) return 'text-yellow-500'; // Yellow (moderate)
	if (value < 90) return 'text-orange-500'; // Orange (high)
	return 'text-red-500'; // Red (critical)
};

const ServerInfo = () => {
	const [systemStats, setSystemStats] = useState(null);
	const [requestStats, setRequestStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const systemResponse = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/system-stats'
				);
				const systemData = await systemResponse.json();

				const requestResponse = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/request-durations'
				);
				const requestData = await requestResponse.json();

				setSystemStats(systemData);
				setRequestStats(requestData);
				setLoading(false);
			} catch (error) {
				console.error('❌ Error fetching metrics:', error);
			}
		};

		fetchStats();
		const interval = setInterval(fetchStats, 5000);
		return () => clearInterval(interval);
	}, []);

	if (loading || !systemStats || !requestStats) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-lg">Loading server data...</div>
			</div>
		);
	}

	const uptimeFormatted = formatUptime(systemStats.uptime);
	const memoryUsage = Math.round(systemStats.memoryUsage);
	const cpuUsage = Math.round(systemStats.cpuUsage);

	// ✅ Calculate Total Requests
	const allTotalRequests = Object.values(requestStats).reduce(
		(sum, route) => sum + route.totalRequests,
		0
	);

	// ✅ Prepare Request Charts (Reduce chart size)
	const routeNames = Object.keys(requestStats);
	// ✅ Prepare Request Charts (Filter & Round)
	const filteredRoutes = Object.keys(requestStats).filter(
		(route) => !['/system-stats', '/request-durations'].includes(route)
	);

	const totalRequests = filteredRoutes.map(
		(route) => requestStats[route].totalRequests
	);
	const avgDurations = filteredRoutes.map((route) =>
		Math.round(requestStats[route].avgDuration)
	);
	const highestDurations = filteredRoutes.map((route) =>
		Math.round(requestStats[route].highestDuration)
	);
	const lowestDurations = filteredRoutes.map((route) =>
		Math.round(requestStats[route].lowestDuration)
	);

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: { beginAtZero: true },
		},
		plugins: {
			legend: { display: false },
		},
	};

	const requestData = {
		labels: routeNames,
		datasets: [
			{
				label: 'Total Requests',
				data: totalRequests,
				backgroundColor: 'rgba(75, 192, 192, 0.7)',
			},
		],
	};

	const avgDurationData = {
		labels: routeNames,
		datasets: [
			{
				label: 'Avg Response Time (ms)',
				data: avgDurations,
				backgroundColor: 'rgba(255, 206, 86, 0.7)',
			},
		],
	};

	const highestDurationData = {
		labels: routeNames,
		datasets: [
			{
				label: 'Highest Response Time (ms)',
				data: highestDurations,
				backgroundColor: 'rgba(255, 99, 132, 0.7)',
			},
		],
	};

	const lowestDurationData = {
		labels: routeNames,
		datasets: [
			{
				label: 'Lowest Response Time (ms)',
				data: lowestDurations,
				backgroundColor: 'rgba(54, 162, 235, 0.7)',
			},
		],
	};

	return (
		<Layout>
			<div className="server-info grid grid-cols-4 gap-4 p-4">
				{/* Server Metrics */}
				<div className="p-4 shadow-lg rounded-lg flex flex-col items-center">
					<h4 className="text-lg font-semibold">Server Uptime</h4>
					<p className="text-2xl font-bold">{uptimeFormatted}</p>
				</div>

				<div
					className={`p-4 shadow-lg rounded-lg flex flex-col items-center ${getUsageColor(
						cpuUsage
					)}`}>
					<h4 className="text-lg font-semibold">CPU Usage</h4>
					<p className="text-2xl font-bold">{cpuUsage}%</p>
				</div>

				<div
					className={`p-4 shadow-lg rounded-lg flex flex-col items-center ${getUsageColor(
						memoryUsage
					)}`}>
					<h4 className="text-lg font-semibold">Memory Usage</h4>
					<p className="text-2xl font-bold">{memoryUsage}%</p>
				</div>

				<div className="p-4 shadow-lg rounded-lg flex flex-col items-center">
					<h4 className="text-lg font-semibold">Total Requests</h4>
					<p className="text-2xl font-bold">
						{allTotalRequests.toLocaleString()}
					</p>
				</div>

				{/* Request Charts */}
				<div className="col-span-2 p-4 shadow-lg rounded-lg">
					<h4 className="text-lg font-semibold">Total Requests Per Route</h4>
					<Bar
						data={requestData}
						options={{ responsive: true }}
					/>
				</div>

				<div className="col-span-2 p-4 shadow-lg rounded-lg">
					<h4 className="text-lg font-semibold">
						Avg Response Time Per Route (ms)
					</h4>
					<Bar
						data={avgDurationData}
						options={{ responsive: true }}
					/>
				</div>

				<div className="col-span-2 p-4 shadow-lg rounded-lg">
					<h4 className="text-lg font-semibold">
						Highest Response Time Per Route (ms)
					</h4>
					<Bar
						data={highestDurationData}
						options={{ responsive: true }}
					/>
				</div>

				<div className="col-span-2 p-4 shadow-lg rounded-lg">
					<h4 className="text-lg font-semibold">
						Lowest Response Time Per Route (ms)
					</h4>
					<Bar
						data={lowestDurationData}
						options={{ responsive: true }}
					/>
				</div>
			</div>
		</Layout>
	);
};

export default ServerInfo;
