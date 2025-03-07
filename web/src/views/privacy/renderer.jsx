// PRIVACY
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Privacy from './privacy';
import FooterSection from '../home_page/FooterSection';

function PrivacyRenderer() {
	return (
		<Layout>
			<Privacy />
			<FooterSection />
		</Layout>
	);
}

export default PrivacyRenderer;
