import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import VersionComponent from '../../components/VersionComponent';

const HeroSection = () => {
	return (
		<section className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12 md:py-20 text-center">
			{/* Background Glow Effect */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-[50vw] h-[30vw] max-w-2xl max-h-2xl bg-red-600/20 blur-[120px] rounded-full"></div>
			</div>

			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, ease: 'easeOut' }}
				className="relative z-0 flex flex-col items-center space-y-6">
				{/* RƎDSYS Logo */}
				<h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-wide drop-shadow-xl">
					<span className="text-white">R</span>
					<span className="text-red-600">Ǝ</span>
					<span className="text-white">D</span>
					<span className="text-white">SYS</span>
				</h1>

				{/* Version Component */}
				<VersionComponent />

				{/* Tagline */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 1 }}
					className="text-lg md:text-xl text-gray-300 max-w-xl">
					Powering the Future, One System at a Time.
				</motion.p>

				{/* Beta Notice */}
				<div className="w-full max-w-2xl bg-yellow-500 text-black font-medium text-sm md:text-base px-6 py-3 rounded-md shadow-md text-center">
					🚧 Application is under development. Features may change, and some
					functionalities are not finalized yet.
				</div>

				{/* Call to Action Button */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 1, duration: 0.5 }}
					className="mt-4">
					<Link
						to="/login"
						className="px-6 py-3 rounded-full border border-red-500 text-red-500 text-lg font-medium transition duration-300 hover:bg-red-500 hover:text-white shadow-lg">
						Login
					</Link>
				</motion.div>
			</motion.div>
		</section>
	);
};

export default HeroSection;
