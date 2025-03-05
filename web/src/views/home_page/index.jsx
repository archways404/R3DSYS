import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import VersionComponent from '../../components/VersionComponent';
import HeroSection from './HeroSection';

function Index() {
	return (
		<Layout>
			<HeroSection />
		</Layout>
	);
}

export default Index;
