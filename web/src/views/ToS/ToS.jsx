import { motion } from 'framer-motion';

const terms = [
	{
		title: 'Acceptance of Terms',
		description:
			'By using our platform, you agree to comply with and be bound by these Terms of Service.',
	},
	{
		title: 'User Responsibilities',
		description:
			'Users must provide accurate information and follow all applicable laws when using the service.',
	},
	{
		title: 'Prohibited Activities',
		description:
			'Misuse, abuse, or unauthorized access to our platform is strictly prohibited.',
	},
	{
		title: 'Privacy and Data Protection',
		description:
			'Your data is handled securely in accordance with our Privacy Policy. We do not sell your personal information.',
	},
	{
		title: 'Modifications to the Service',
		description:
			'We reserve the right to modify or discontinue any part of the service at any time.',
	},
	{
		title: 'Termination of Accounts',
		description:
			'Accounts may be suspended or terminated for violations of these terms.',
	},
];

const ToS = () => {
	return (
		<section className="relative w-full text-white bg-transparent">
			<div className="relative z-10 mx-auto max-w-6xl px-6">
				{/* Title */}
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="text-xl font-semibold text-red-500 uppercase tracking-wider">
					Terms of Service
				</motion.h2>

				{/* Main Header */}
				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 1 }}
					className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Know Your Rights and Responsibilities
				</motion.h3>

				{/* Introductory Text */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 1 }}
					className="mt-4 text-lg text-gray-300 max-w-2xl">
					Please review our Terms of Service carefully before using our platform. By accessing our
					services, you agree to the following terms and conditions.
				</motion.p>

				{/* Terms Grid */}
				<div className="grid grid-cols-1 gap-10 mt-16 sm:grid-cols-2 lg:grid-cols-2">
					{terms.map((term, index) => (
						<motion.div
							key={term.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 * index, duration: 0.8 }}
							className="flex flex-col p-6 bg-transparent rounded-xl border border-gray-700 transition-transform duration-300 hover:scale-[1.03]">
							{/* Term Title */}
							<h4 className="text-lg font-semibold text-red-500">{term.title}</h4>

							{/* Term Description */}
							<p className="mt-3 text-sm text-gray-400">{term.description}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ToS;
