import { Badge } from '@/components/ui/badge';

const roleColors = {
	worker: 'bg-white text-black border border-gray-300',
	admin: 'bg-red-600 text-white hover:bg-red-500',
	maintainer: 'bg-green-600 text-white hover:bg-green-500',

	default: 'bg-gray-500 text-white',
};

const UserGroups = ({ groups, role }) => {
	return (
		<div className="space-y-4 p-4 rounded-lg shadow-sm">
			<h3 className="text-lg font-semibold">Role</h3>
			{/* Role Badge with dynamic colors */}
			<div className="flex items-center gap-2">
				<Badge
					className={`${roleColors[role] || roleColors.default} capitalize`}>
					{role}
				</Badge>
			</div>
			<h3 className="text-lg font-semibold">Groups</h3>

			{/* Groups Badges */}
			<div className="mt-2 flex flex-wrap gap-2">
				{groups && groups.length > 0 ? (
					groups.map((group, index) => (
						<Badge
							key={group.id || index}
							className="bg-blue-500 text-white">
							{group.name}
						</Badge>
					))
				) : (
					<p className="text-gray-500">Not assigned to any groups.</p>
				)}
			</div>
		</div>
	);
};

export default UserGroups;
