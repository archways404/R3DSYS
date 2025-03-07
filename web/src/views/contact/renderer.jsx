// CONTACT
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Contact from './Contact';
import FooterSection from '../home_page/FooterSection';

function ContactRenderer() {
	return (
		<Layout>
			<Contact />
			<FooterSection />
		</Layout>
	);
}

export default ContactRenderer;
