import React from 'react';

function GroupSelector({ groups, onGroupSelect }) {
	return (
		<div className="flex items-center justify-center">
			<div className="w-full max-w-md p-6 rounded-xl">
				<div className="flex flex-wrap gap-2">
					{groups.map((group) => (
						<button
							key={group.id}
							onClick={() => onGroupSelect(group.id)}
							className="flex-1 px-4 py-2 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
							{group.name || group.id}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

export default GroupSelector;
