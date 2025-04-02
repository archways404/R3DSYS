import ManagementGrid from './ManagementGrid';
import Layout from '@/components/Layout';

import { GrSchedule } from 'react-icons/gr';
import { TbReport } from 'react-icons/tb';
import { HiTemplate } from 'react-icons/hi';
import { GrSchedules } from 'react-icons/gr';
import { LuMailPlus } from 'react-icons/lu';
import { FaUsers } from 'react-icons/fa';
import { SiGooglecalendar } from 'react-icons/si';
import { FaRegCalendarPlus } from 'react-icons/fa6';
import { GrServerCluster } from 'react-icons/gr';
import { FiDatabase } from 'react-icons/fi';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import { LuCircleUserRound } from 'react-icons/lu';
import { FaChevronUp } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import { BiGroup } from 'react-icons/bi';
import { LogOut } from 'lucide-react';

import { CgProfile } from 'react-icons/cg';

import {
	Home,
	Settings,
	Bell,
	User,
	Info,
	Send,
	Handshake,
	Cookie,
	GlobeLock,
	Construction,
	ServerCrash,
	ServerOff,
	Rss,
} from 'lucide-react';

const managementLinks = [
	{
		title: 'Invite',
		to: '/invite',
		icon: LuMailPlus,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Accounts',
		to: '/manage-users',
		icon: FaUsers,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Groups',
		to: '/handle-groups',
		icon: BiGroup,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Server',
		to: '/serverinfo',
		icon: GrServerCluster,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'System',
		to: '/system',
		icon: GrServerCluster,
		roles: ['admin', 'maintainer'],
	},
	{
		title: 'Tables',
		to: '/tables',
		icon: FiDatabase,
		roles: ['admin', 'maintainer'],
	},
];

const adminLinks = [
	{ title: 'Template', to: '/handle-template', icon: HiTemplate, roles: ['admin'] },
	{ title: 'Shifts', to: '/handle-shifts', icon: GrSchedules, roles: ['admin', 'maintainer'] },
];

const ManagementRenderer = () => {
	return (
		<Layout>
			<ManagementGrid
				links={managementLinks.concat(adminLinks)}
				userRole="admin"
			/>
		</Layout>
	);
};

export default ManagementRenderer;
