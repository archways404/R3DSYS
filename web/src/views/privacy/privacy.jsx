import { motion } from 'framer-motion';

const privacyPolicies = [
	{
		title: 'Data Collection',
		description:
			'We collect personal and usage data to enhance your experience. This may include your name, email, and browsing behavior.',
	},
	{
		title: 'Use of Information',
		description:
			'Your data is used to improve our services, provide support, and ensure security. We do not sell your personal information.',
	},
	{
		title: 'Data Sharing & Third Parties',
		description:
			'We may share data with trusted partners for analytics, security, and compliance with legal requirements.',
	},
	{
		title: 'Security Measures',
		description:
			'We implement industry-standard security measures to protect your personal data from unauthorized access.',
	},
	{
		title: 'Cookies & Tracking',
		description:
			'We use cookies and similar tracking technologies to enhance user experience and analyze website traffic.',
	},
	{
		title: 'User Rights',
		description:
			'You have the right to access, modify, or delete your personal data. Contact us to make a request.',
	},
];

const Privacy = () => {
	return (
		<section className="relative w-full text-white bg-transparent">
			<div className="relative z-10 mx-auto max-w-6xl px-6">
				{/* Title */}
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="text-xl font-semibold text-red-500 uppercase tracking-wider">
					Privacy Policy
				</motion.h2>

				{/* Main Header */}
				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 1 }}
					className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Your Data, Your Control
				</motion.h3>

				{/* Introductory Text */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 1 }}
					className="mt-4 text-lg text-gray-300 max-w-2xl">
					We take your privacy seriously. Learn how we collect, use, and protect your data when
					using our platform.
				</motion.p>

				{/* Privacy Policy Grid */}
				<div className="grid grid-cols-1 gap-10 mt-16 sm:grid-cols-2 lg:grid-cols-2">
					{privacyPolicies.map((policy, index) => (
						<motion.div
							key={policy.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 * index, duration: 0.8 }}
							className="flex flex-col p-6 bg-transparent rounded-xl border border-gray-700 transition-transform duration-300 hover:scale-[1.03]">
							{/* Policy Title */}
							<h4 className="text-lg font-semibold text-red-500">{policy.title}</h4>

							{/* Policy Description */}
							<p className="mt-3 text-sm text-gray-400">{policy.description}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Privacy;
