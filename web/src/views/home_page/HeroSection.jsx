import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { ArrowRight } from 'lucide-react';
import VersionComponent from '../../components/VersionComponent';

const HeroSection = () => {
	return (
		<section className="relative flex flex-col items-center justify-center pt-28 pb-20 w-full text-center">
			{/* Background Glow Effect */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="w-[60vw] h-[40vw] max-w-3xl max-h-2xl bg-red-600/30 blur-[140px] rounded-full"></div>
			</div>

			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, ease: 'easeOut' }}
				className="relative z-10 flex flex-col items-center space-y-4 w-full px-6">
				{/* RƎDSYS Logo */}
				<h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-wide drop-shadow-xl">
					<span className="text-white">R</span>
					<span className="text-red-600">Ǝ</span>
					<span className="text-white">D</span>
					<span className="text-white">SYS</span>
				</h1>

				{/* Tagline */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 1 }}
					className="text-lg md:text-xl font-bold text-gray-300 max-w-2xl">
					Don't work backwards.
				</motion.p>

				{/* Version */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 1 }}>
					<VersionComponent />
				</motion.div>

				{/* Beta Notice */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 1 }}
					className="!mt-12 bg-yellow-500 text-black font-medium text-xs sm:text-sm md:text-base px-8 py-3 rounded-md shadow-lg text-center">
					🚧 Application is under development. Features may change, and some functionalities are not
					finalized yet.
				</motion.div>

				{/* Call to Action Button */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 1, duration: 0.5 }}
					className="!mt-12">
					<Link to="/login">
						<HoverBorderGradient
							containerClassName="rounded-full"
							as="button"
							className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-6 py-2 text-md font-semibold transition-all duration-300 hover:scale-105 shadow-md">
							<span className="text-base">Enter Now</span>
							<ArrowRight className="w-5 h-5 stroke-[3]" />
						</HoverBorderGradient>
					</Link>
				</motion.div>
			</motion.div>
		</section>
	);
};

export default HeroSection;
