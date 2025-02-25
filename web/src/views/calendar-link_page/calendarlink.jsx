import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CalendarLink = () => {
	const { user } = useContext(AuthContext);
	const userLink = import.meta.env.VITE_BASE_ADDR + '/ical/' + user.uuid;

	if (!user) {
		return null;
	}

	const { toast } = useToast();

	const handleCopyClick = () => {
		navigator.clipboard.writeText(userLink).then(
			() => {
				toast({
					description: 'Link copied to clipboard!',
					duration: 1500,
				});
			},
			(err) => {
				toast({
					title: 'Error',
					description: err,
					variant: 'destructive',
					duration: 1500,
				});
				console.error('Failed to copy: ', err);
			}
		);
	};

	return (
		<Layout>
			{/* Container to center content */}
			<div className="flex items-center justify-center mt-10 bg-transparent dark:bg-transparent">
				<div className="flex flex-col items-center space-y-6">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Google Calendar URL
					</h2>
					{/* Row container for Input and Button */}
					<div className="flex items-center space-x-4">
						<Input
							id="link"
							type="text"
							value={userLink}
							readOnly
							className="px-3 py-2 w-72 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 bg-transparent dark:bg-transparent dark:text-white"
						/>
						<button
							onClick={handleCopyClick}
							className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
							Copy
						</button>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default CalendarLink;
