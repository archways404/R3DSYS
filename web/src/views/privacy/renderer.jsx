// PRIVACY
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Privacy from './privacy';
import FooterSection from '../home_page/FooterSection';

function PrivacyRenderer() {
	return (
		<Layout>
			<div className="flex flex-col h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-6.5rem)]">
				<div className="flex-1 overflow-auto">
					<Privacy />
				</div>
				<FooterSection />
			</div>
		</Layout>
	);
}

export default PrivacyRenderer;
