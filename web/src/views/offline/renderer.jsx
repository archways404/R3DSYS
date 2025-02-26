import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function OfflineRenderer() {
	return (
		<Layout>
			<div className="flex flex-col items-center justify-center max-h-screen w-full px-4 py-48">
				{/* Offline Warning */}
				<h1 className="text-7xl lg:text-8xl font-extrabold text-white tracking-wider mb-10 drop-shadow-xl">
					<span className="text-red-600">RƎD</span>SYS
				</h1>
				<h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-wider mb-16 drop-shadow-xl">
					<span className="text-red-600">OFFLINE</span>
				</h2>

				{/* Warning Message */}
				<div className="bg-yellow-500 text-black font-medium text-sm md:text-base px-6 py-3 rounded-md shadow-md text-center mb-12 whitespace-nowrap overflow-hidden">
					⚠️ Unable to connect to the server. Please check your internet
					connection or try again later.
				</div>

				{/* Retry and Home Buttons */}
				<div className="flex space-x-4">
					<Link
						to="/"
						className="px-6 py-2 text-base font-semibold border-2 border-yellow-500 text-yellow-500 rounded-full transition-all duration-200 hover:bg-yellow-500 hover:text-black shadow-sm">
						Retry
					</Link>
				</div>
			</div>
		</Layout>
	);
}

export default OfflineRenderer;
