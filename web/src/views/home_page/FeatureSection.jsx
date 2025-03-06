import { motion } from 'framer-motion';
import {
	CalendarDaysIcon,
	ArrowsRightLeftIcon,
	ViewColumnsIcon,
	CloudArrowDownIcon,
	UsersIcon,
	ClockIcon,
} from '@heroicons/react/24/outline';

const features = [
	{
		name: 'Availability',
		description:
			'Employees can easily submit their available working days without needing manual coordination.',
		icon: CalendarDaysIcon,
	},
	{
		name: 'Trades',
		description:
			'Workers can request and trade shifts seamlessly within the system, reducing back-and-forth communication.',
		icon: ArrowsRightLeftIcon,
	},
	{
		name: 'Overview',
		description:
			'An intuitive schedule layout that provides a clear overview of assigned shifts and open slots.',
		icon: ViewColumnsIcon,
	},
	{
		name: 'Modern Integrations',
		description:
			'Easily sync assigned shifts to your Google Calendar for quick and easy access.',
		icon: CloudArrowDownIcon,
	},
	{
		name: 'Administrative Controls',
		description:
			'Supervisors can create, edit, and manage schedules efficiently with built-in tools.',
		icon: UsersIcon,
	},
	{
		name: 'Time Tracking',
		description:
			'Track working hours and shift history directly within the system for easy reference.',
		icon: ClockIcon,
	},
];

const FeatureSection = () => {
	return (
		<section className="relative w-full py-20 text-white bg-transparent">
			<div className="relative z-10 mx-auto max-w-6xl px-6">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="text-xl font-semibold text-red-500 uppercase tracking-wider">
					Core Features
				</motion.h2>

				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 1 }}
					className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Work smarter, not harder.
				</motion.h3>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 1 }}
					className="mt-4 text-lg text-gray-300 max-w-2xl">
					Manage shift availability, trades, and schedules with ease. An
					all-in-one solution designed for both employees and administrators.
				</motion.p>

				{/* Features Grid */}
				<div className="grid grid-cols-1 gap-10 mt-16 sm:grid-cols-2 lg:grid-cols-2">
					{features.map((feature, index) => (
						<motion.div
							key={feature.name}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 * index, duration: 0.8 }}
							className="flex flex-col p-6 bg-transparent rounded-xl border border-gray-700 transition-transform duration-300 hover:scale-[1.03]">
							{/* Icon & Title in One Row */}
							<div className="flex items-center space-x-3">
								<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-transparent">
									<feature.icon
										className="w-6 h-6 text-red-500"
										aria-hidden="true"
									/>
								</div>
								<h4 className="text-lg font-semibold">{feature.name}</h4>
							</div>

							{/* Feature Description Below */}
							<p className="mt-3 text-sm text-gray-400">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeatureSection;
