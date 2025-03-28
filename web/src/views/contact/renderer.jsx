// CONTACT
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Contact from './Contact';
import FooterSection from '../home_page/FooterSection';


function ContactRenderer() {
	return (
		<Layout>
			<div className="flex flex-col h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-6.5rem)]">
				{' '}
				{/* use h-screen, not min-h/max-h */}
				<div className="flex-1 flex items-center justify-center overflow-hidden">
					<Contact />
				</div>
				<FooterSection />
			</div>
		</Layout>
	);
}

export default ContactRenderer;
