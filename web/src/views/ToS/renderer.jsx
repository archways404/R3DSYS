// TOS
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ToS from './ToS';
import FooterSection from '../home_page/FooterSection';

function ToSRenderer() {
	return (
		<Layout>
			<ToS />
			<FooterSection />
		</Layout>
	);
}

export default ToSRenderer;
