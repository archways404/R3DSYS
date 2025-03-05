import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { MdOutlineEmail } from 'react-icons/md';
import { BiDonateHeart } from 'react-icons/bi';
import { IoNewspaperOutline } from 'react-icons/io5';

const FooterSection = () => {
	return (
		<footer className="relative w-full text-gray-400 py-6 px-6">
			{/* Footer Container */}
			<div className="max-w-6xl mx-auto flex flex-col items-center space-y-3 text-center">
				{/* Row 1: Navigation */}
				<div className="flex flex-wrap items-center justify-center gap-6">
					{/* Social Media Icons */}
					<div className="flex space-x-4">
						<a
							href="https://github.com/archways404/R3DSYS"
							target="_blank"
							rel="noopener noreferrer"
							className="transition text-gray-400 hover:text-red-500">
							<FaGithub className="w-5 h-5" />
						</a>
						<a
							href="mailto:support@r3dsys.com"
							target="_blank"
							rel="noopener noreferrer"
							className="transition text-gray-400 hover:text-red-500">
							<MdOutlineEmail className="w-5 h-5" />
						</a>
						<a
							href="https://github.com/archways404/R3DSYS/releases"
							target="_blank"
							rel="noopener noreferrer"
							className="transition text-gray-400 hover:text-red-500">
							<IoNewspaperOutline className="w-5 h-5" />
						</a>
						<a
							href="https://github.com/sponsors/archways404"
							target="_blank"
							rel="noopener noreferrer"
							className="transition text-gray-400 hover:text-red-500">
							<BiDonateHeart className="w-5 h-5" />
						</a>
					</div>
				</div>

				{/* Row 2: Navigation */}
				<div className="flex flex-wrap items-center justify-center gap-6">
					{/* Navigation Links */}
					<nav className="flex space-x-6 text-sm">
						<Link
							to="/"
							className="transition text-gray-400 hover:text-red-500">
							Placeholder
						</Link>
						<Link
							to="/"
							className="transition text-gray-400 hover:text-red-500">
							Placeholder
						</Link>
						<Link
							to="/"
							className="transition text-gray-400 hover:text-red-500">
							Placeholder
						</Link>
						<Link
							to="/"
							className="transition text-gray-400 hover:text-red-500">
							Placeholder
						</Link>
						<Link
							to="/"
							className="transition text-gray-400 hover:text-red-500">
							Placeholder
						</Link>
					</nav>
				</div>

				{/* Row 3: Copyright */}
				<p className="text-xs text-gray-500">
					&copy; {new Date().getFullYear()} RƎDSYS. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default FooterSection;
