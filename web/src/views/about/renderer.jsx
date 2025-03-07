// ABOUT
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import About from './About';
import FooterSection from '../home_page/FooterSection';

function AboutRenderer() {
	return (
		<Layout>
			<About />
			<FooterSection />
		</Layout>
	);
}

export default AboutRenderer;
