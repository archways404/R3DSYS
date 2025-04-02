import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const CardButton = ({ title, to, Icon }) => {
	const navigate = useNavigate();

	return (
		<motion.div
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.98 }}
			className="cursor-pointer"
			onClick={() => navigate(to)}>
			<Card className="h-full border border-border rounded-xl shadow-sm transition-colors hover:bg-muted/40">
				<CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
					<Icon className="w-10 h-10 text-primary" />
					<p className="text-lg font-medium">{title}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
};

const ManagementGrid = ({ links, userRole }) => {
	const visibleLinks = links.filter((link) => link.roles.includes(userRole));

	return (
		<div className="flex justify-center mt-10">
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl w-full">
				{visibleLinks.map((link) => (
					<CardButton
						key={link.to}
						title={link.title}
						to={link.to}
						Icon={link.icon}
					/>
				))}
			</div>
		</div>
	);
};

export default ManagementGrid;
