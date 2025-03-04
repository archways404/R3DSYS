import React, { useContext } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Adjust the import path
import { AuthContext } from '../../context/AuthContext';
import WeekOverviewComponent from './WeekOverviewComponent';
import MonthOverviewComponent from './MonthOverviewComponent';

const TabComponent = ({ shifts }) => {
	const { user } = useContext(AuthContext);
	if (!user) return null;

	return (
		<div className="w-full max-w-4xl mx-auto">
			<Tabs
				defaultValue="week"
				className="w-full">
				<TabsList className="grid grid-cols-2 w-full">
					<TabsTrigger value="week">Week</TabsTrigger>
					<TabsTrigger value="month">Month</TabsTrigger>
				</TabsList>

				<TabsContent value="week">
					<WeekOverviewComponent shifts={shifts} />
				</TabsContent>

				<TabsContent value="month">
					<MonthOverviewComponent shifts={shifts} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default TabComponent;
