import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import Layout from '../../components/Layout';
import FooterSection from '../home_page/FooterSection';

function NotFound() {
	return (
		<Layout>
			<div className="flex flex-col min-h-screen">
				{/* Main Content Wrapper (404 Section) */}
				<section className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full py-12 md:py-24 text-center">
					{/* Background Glow Effect */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-[50vw] h-[30vw] max-w-2xl max-h-2xl bg-red-600/30 blur-[140px] rounded-full"></div>
					</div>

					{/* Main Content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: 'easeOut' }}
						className="relative z-10 flex flex-col items-center space-y-6 w-full px-6">
						{/* Error Code */}
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 1 }}
							className="text-5xl font-extrabold text-red-500">
							404
						</motion.p>

						{/* Title */}
						<motion.h1
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 1 }}
							className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
							Page Not Found
						</motion.h1>

						{/* Description */}
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 1 }}
							className="text-lg text-gray-300 max-w-lg">
							Sorry, we couldn’t find the page you were looking for.
						</motion.p>

						{/* Call to Action Button */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.6, duration: 0.5 }}
							className="mt-4">
							<Link to="/">
								<HoverBorderGradient
									containerClassName="rounded-full"
									as="button"
									className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-6 py-2 text-md font-semibold transition-all duration-300 hover:scale-105 shadow-md">
									<span>Go Back Home</span>
								</HoverBorderGradient>
							</Link>
						</motion.div>
					</motion.div>
				</section>

				{/* Footer Always Visible */}
				<FooterSection />
			</div>
		</Layout>
	);
}

export default NotFound;
