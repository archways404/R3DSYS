import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import ActiveShifts from './active-shifts';

function TableRenderer() {
	const [renderState, setRenderState] = useState('default');

	/*
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	if (!user) {
		return null;
	}
  */

	return (
		<Layout>
			<Button onClick={() => setRenderState('active-shifts')}>
				Active Shifts
			</Button>

			{/* Keep the component in the DOM but hide it if not needed */}
			{renderState === 'active-shifts' ? <ActiveShifts /> : null}
		</Layout>
	);
}

export default TableRenderer;
