import { motion } from 'framer-motion';
import { Mail, Github } from 'lucide-react'; // Import icons

const Contact = () => {
	// Open mail client
	const handleEmailClick = () => {
		window.location.href = `mailto:archways@gmx.us`;
	};

	// Open GitHub Repo
	const handleGitHubClick = () => {
		window.open('https://github.com/archways404/R3DSYS', '_blank');
	};

	return (
		<section className="relative w-full min-h-[calc(100vh-100px)] flex items-center justify-center text-white bg-transparent">
			<div className="relative z-10 max-w-6xl px-6 text-center">
				{/* Animated Header */}
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: 'easeOut' }}
					className="text-xl font-semibold text-red-500 uppercase tracking-wider">
					Contact
				</motion.h2>

				<motion.h3
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 1 }}
					className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
					Let's Get in Touch
				</motion.h3>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 1 }}
					className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
					Feel free to contact me via email or check out the project on GitHub.
				</motion.p>

				{/* Contact Options */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-md mx-auto">
					{/* Email Card */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleEmailClick}
						className="flex items-center justify-center p-4 rounded-xl  cursor-pointer transition-transform hover:shadow-lg">
						<Mail className="w-8 h-8 text-red-500" />
					</motion.div>

					{/* GitHub Card */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleGitHubClick}
						className="flex items-center justify-center p-4 rounded-xl  cursor-pointer transition-transform hover:shadow-lg">
						<Github className="w-8 h-8 text-white" />
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default Contact;
