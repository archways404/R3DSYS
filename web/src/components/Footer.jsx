import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="bg-transparent text-white py-6">
			<div
				className="container mx-auto mt-4 pt-4 text-center text-gray-400"
				style={{
					borderTop: '1px solid', // Adjust thickness if needed
					borderImage:
						'linear-gradient(to right, transparent, red, transparent) 1',
				}}>
				<p>&copy; 2025 archways404. All rights reserved.</p>
			</div>
		</footer>
	);
}
