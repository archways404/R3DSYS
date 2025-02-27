import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button'; // ShadCN button

const CreationGroup = ({ onSelectGroup, goBack }) => {
	const { user } = useContext(AuthContext);

	// Handle selecting a group
	const handleGroupSelect = (group) => {
		onSelectGroup({
			id: group.id,
			name: group.name,
		});
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-screen px-6">
				<div className="w-full max-w-lg rounded-2xl p-8">
					<h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
						Select a Group
					</h2>

					{user.groups.length === 0 ? (
						<p className="text-center text-gray-500 dark:text-gray-400 text-lg">
							No groups available.
						</p>
					) : (
						<div className="space-y-4">
							{user.groups.map((group) => (
								<Button
									key={group.id}
									variant="outline"
									className="w-full text-lg font-semibold border-gray-300 dark:border-gray-600 rounded-xl py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700"
									onClick={() => handleGroupSelect(group)}>
									{group.name}
								</Button>
							))}
						</div>
					)}

					<div className="mt-6">
						<Button
							variant="outline"
							onClick={goBack}
							className="w-full text-lg font-semibold border-gray-400 dark:border-gray-500 rounded-xl py-3 transition hover:bg-gray-100 dark:hover:bg-gray-700">
							Back
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CreationGroup;
