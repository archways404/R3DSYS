import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import VersionComponent from '../../components/VersionComponent';

function Index() {
	return (
		<Layout>
			<div className="flex flex-col items-center justify-center max-h-screen w-full px-4 py-48">
				{/* Logo / Title */}
				<div className="text-center mb-10">
					<h1 className="text-7xl lg:text-8xl font-extrabold text-white tracking-wider mb-2 drop-shadow-xl">
						<span className="text-red-600">RƎD</span>SYS
					</h1>

					{/* ✅ Version Component Below the Logo */}
					<VersionComponent />
				</div>

				{/* Beta Notice - Uses Full Width If Needed */}
				<div className="bg-yellow-500 text-black font-medium text-sm md:text-base px-6 py-3 rounded-md shadow-md text-center mb-12 whitespace-nowrap overflow-hidden">
					🚧 Application is under development. Features may change, and some
					functionalities are not finalized yet.
				</div>

				{/* Login Button */}
				<Link
					to="/login"
					className="px-6 py-2 text-base font-semibold border-2 border-red-500 text-red-500 rounded-full transition-all duration-200 hover:bg-red-500 hover:text-white shadow-sm">
					Login
				</Link>
			</div>
		</Layout>
	);
}

export default Index;
