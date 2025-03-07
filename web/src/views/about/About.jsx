import { motion } from 'framer-motion';

const About = () => {
	return (
		<section className="relative w-full py-20 text-white bg-transparent">
			<div className="relative z-10 mx-auto max-w-6xl px-6">
				{/* Animated Header */}
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="text-xl font-semibold text-red-500 uppercase tracking-wider">
					About RƎDSYS
				</motion.h2>

				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 1 }}
					className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Modernizing Scheduling at Malmö University
				</motion.h3>

				{/* Introductory Text */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 1 }}
					className="mt-4 text-lg text-gray-300 max-w-2xl">
					RƎDSYS is a modern, open-source scheduling system built to simplify
					shift planning for
					<strong> hourly employees and employers </strong> at Malmö University.
					No more email chains, no more manual schedules — just a streamlined,
					<strong> centralized </strong> approach to workforce management.
				</motion.p>

				{/* Grid Layout for Key Highlights */}
				<div className="grid grid-cols-1 gap-10 mt-16 sm:grid-cols-2 lg:grid-cols-2">
					{/* Left Column - The Issue */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1 }}
						className="p-6 rounded-xl border border-gray-700 bg-transparent">
						<h4 className="text-lg font-semibold text-red-500">The Issue</h4>
						<p className="mt-3 text-sm text-gray-400">
							The existing process relied heavily on email communication, manual
							scheduling, and outdated web interfaces — making it slow,
							cumbersome, and inefficient and prone to errors.
						</p>
					</motion.div>

					{/* Right Column - The Solution */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 1 }}
						className="p-6 rounded-xl border border-gray-700 bg-transparent">
						<h4 className="text-lg font-semibold text-red-500">A solution</h4>
						<p className="mt-3 text-sm text-gray-400">
							With RƎDSYS, employees can <strong>easily</strong> report their
							availability and make minor modifications like trading shifts etc,
							while employers can
							<strong> instantly </strong> create, manage, and publish schedules
							without unnecessary work.
						</p>
					</motion.div>
				</div>

				{/* Unique Features Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 1 }}
						className="p-6 bg-transparent rounded-xl border border-gray-700">
						<h4 className="text-lg font-semibold text-red-500">
							Open Source, with Dual Licensing
						</h4>
						<p className="mt-3 text-sm text-gray-400">
							RƎDSYS is open-source under a <strong>dual-license model</strong>.
							It is available under the{' '}
							<a
								href="https://github.com/archways404/R3DSYS/blob/master/LICENSE"
								className="text-red-500 hover:underline"
								target="_blank"
								rel="noopener noreferrer">
								Mozilla Public License 2.0 (MPL-2.0)
							</a>{' '}
							for open-source projects, allowing anyone to modify and share
							their improvements. For proprietary use, a separate commercial
							license is available.{' '}
							<a
								href="/contact"
								className="text-red-500 hover:underline">
								Contact us
							</a>{' '}
							for details.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 1 }}
						className="p-6 bg-transparent rounded-xl border border-gray-700">
						<h4 className="text-lg font-semibold text-red-500">
							Built for Malmö University
						</h4>
						<p className="mt-3 text-sm text-gray-400">
							Unlike generic scheduling tools, RƎDSYS is specifically tailored
							for Malmö University’s needs —
							<strong> faster, simpler, and cheaper </strong>
							than any alternative on the market.
						</p>
					</motion.div>
				</div>

				{/* The Future of R3DSYS */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 1 }}
					className="mt-16 p-8 bg-transparent rounded-xl border border-gray-700 text-center">
					{/* Project Name with Highlight */}
					<h3 className="text-4xl font-extrabold text-white tracking-wide">
						<span className="text-white">R</span>
						<span className="text-red-500">Ǝ</span>
						<span className="text-white">D</span>
						<span className="text-white">SYS</span>
					</h3>

					{/* Created & Maintained By */}
					<p className="mt-2 text-lg font-semibold text-gray-300">
						Created & Maintained by{' '}
						<span className="text-red-500">archways404</span>
					</p>

					{/* Optional Divider */}
					<div className="w-16 h-1 bg-gray-800 mx-auto mt-4 mb-6 rounded-full"></div>

					<p className="mt-4 text-md text-center text-gray-400">
						I am constantly working to <strong>improve and expand</strong>{' '}
						RƎDSYS with new features, performance enhancements, and a better
						user experience.
					</p>

					{/* GitHub Star CTA */}
					<div className="mt-6">
						<p className="text-md text-gray-400">
							If you like the project and want to show support, consider giving
							it a star on GitHub!
						</p>
						<a
							href="https://github.com/archways404/R3DSYS"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105">
							⭐ Star on GitHub
						</a>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default About;
