import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ConsentContext } from '../../context/ConsentContext';
import { RenderContext } from '../../context/RenderContext';

import Layout from '../../components/Layout';
import OverviewComponent from './OverviewComponent';

const MyShiftsRenderer = () => {
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const { setRenderLoading } = useContext(RenderContext);

	const [renderDay, setRenderDay] = useState(null);
	const [shifts, setShifts] = useState([]);
	const [error, setError] = useState(null);

	console.log('user', user);
	console.log('shifts', shifts);
	console.log('Selected Render Day:', renderDay);

	if (!user) {
		return null;
	}

	// Fetch active shifts for the user
	useEffect(() => {
		const fetchShifts = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getActiveShiftsForUser`,
					{
						method: 'GET',
						credentials: 'include',
					}
				);

				if (!response.ok) {
					throw new Error(`Error fetching shifts: ${response.statusText}`);
				}

				const data = await response.json();
				setShifts(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setRenderLoading(false);
			}
		};

		fetchShifts();
	}, []);

	useEffect(() => {
		setRenderDay(new Date()); // Set today's date after mounting
	}, []);

	return (
		<Layout>
			<OverviewComponent shifts={shifts} />
		</Layout>
	);
};

export default MyShiftsRenderer;
