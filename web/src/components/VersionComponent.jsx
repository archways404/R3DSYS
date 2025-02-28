import React, { useContext } from 'react';
import { VersionContext } from './Layout'; // ✅ Import VersionContext
import { Badge } from '@/components/ui/badge'; // ✅ ShadCN Badge
import { Skeleton } from '@/components/ui/skeleton'; // ✅ ShadCN Skeleton

const VersionComponent = () => {
	const { version, loading } = useContext(VersionContext); // ✅ Use version from context

	return (
		<div className="mt-2 flex flex-col items-center">
			{loading ? (
				<Skeleton className="w-20 h-6 rounded-md" />
			) : (
				<Badge
					variant="outline"
					className="text-yellow-500 border-yellow-500 text-sm">
					<span>v</span>
					{version}
				</Badge>
			)}
		</div>
	);
};

export default VersionComponent;
