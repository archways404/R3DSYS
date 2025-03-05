import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import VersionComponent from '../../components/VersionComponent';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import FooterSection from './FooterSection';

function Index() {
	return (
		<Layout>
			<HeroSection />
			<FeatureSection />
			<FooterSection />
		</Layout>
	);
}

export default Index;
