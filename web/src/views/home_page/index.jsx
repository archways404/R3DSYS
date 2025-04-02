import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import VersionComponent from '../../components/VersionComponent';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeatureSection from './FeatureSection';
import FooterSection from './FooterSection';

function Index() {
	return (
		<Layout>
			<HeroSection />
			<StatsSection />
			<FeatureSection />
			<FooterSection />
		</Layout>
	);
}

export default Index;
