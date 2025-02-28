import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Badge } from '@/components/ui/badge'; // ✅ ShadCN Badge
import { Skeleton } from '@/components/ui/skeleton'; // ✅ ShadCN Skeleton

const VersionComponent = () => {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const [version, setVersion] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/version`
				);
				const data = await response.json();

				if (response.ok) {
					setVersion(data.version); // ✅ Get "version" instead of "api"
				} else {
					toast({
						description: data.error || 'Failed to fetch version information.',
						variant: 'destructive',
					});
				}
			} catch (error) {
				toast({
					description: 'Error fetching version information.',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchVersion();
	}, []);

	return (
		<div className="mt-2 flex flex-col items-center">
			{/* ✅ Display Skeleton if Loading */}
			{loading ? (
				<Skeleton className="w-20 h-6 rounded-md" />
			) : (
				<Badge
					variant="outline"
					className="text-green-600 text-sm">
					<span>v</span>
					{version}
				</Badge>
			)}
		</div>
	);
};

export default VersionComponent;
