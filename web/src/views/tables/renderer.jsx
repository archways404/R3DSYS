import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import ActiveShifts from './active-shifts';

function TableRenderer() {
	const [renderState, setRenderState] = useState('default');

	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	if (!user) {
		return null;
	}

	return (
		<Layout>
			{/* Button Container */}
			<div className="flex gap-4 p-4 rounded-md mb-4">
				{/* If state is "default", show only the "Active Shifts" button */}
				{renderState === 'default' ? (
					<Button
						variant="default"
						onClick={() => setRenderState('active-shifts')}>
						Active Shifts
					</Button>
				) : (
					/* If state is anything else, show only the "Back" button */
					<Button
						className="text-gray-600 dark:text-gray-300 bg-transparent hover:bg-transparent hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
						onClick={() => setRenderState('default')}>
						← Back
					</Button>
				)}
			</div>

			{/* Render ActiveShifts when selected */}
			{renderState === 'active-shifts' && <ActiveShifts />}
		</Layout>
	);
}

export default TableRenderer;
