import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ConsentProvider } from './context/ConsentContext';
import { RenderProvider } from './context/RenderContext';

import Index from './views/home_page/index.jsx';
import Login from './views/login_page/login.jsx';
import ForgotPass from './views/forgot-password_page/forgotpass.jsx';
import ResetPass from './views/reset-password_page/resetpass';
import SetPass from './views/set-password_page/setpass.jsx';
import Logout from './components/Logout.jsx';
import NotFound from './views/not-found_page/notFound';
import Welcome from './views/welcome/welcome_page.jsx';
import Invite from './views/invite_page/invite';

//import Schedule from './views/display-schedule_page/schedule';
import Schedule from './views/schedule/renderer';

import TemplateRenderer from './views/template/renderer';

import AuthWrapper from './components/AuthWrapper';
import UnAuthWrapper from './components/UnAuthWrapper';

import CalendarLink from './views/calendar-link_page/calendarlink';
import ManageUsers from './views/manage-users_page/manageusers';
import UserDetail from './views/display-user-details_page/userdetail';
import ServerPanel from './views/server-panel_page/serverpanel';
import EmailStatus from './views/email-status_page/emailstatus';

//import TestHandleShifts from './views/create-shifttypes_page/testHandleShifts';
import ShiftRenderer from './views/shift/renderer';

import CreateTemplate from './views/create-template_page/createTemplate';
import StatusMsg from './views/status-messages_page/statusmsg';

import ServerInfo from './old/serverinfo';

import CreateSchedule from './views/create-schedule_page/create_schedule';

import ApplyUnassigned from './views/apply-unassigned_page/apply_unassigned';

import AssignShifts from './views/assign_shifts_page/assign_shifts';

import TableRenderer from './views/tables/renderer';

import OfflineRenderer from './views/offline/renderer';

import GroupRenderer from './views/groups/renderer';

import BugreportRenderer from './views/bugreport/renderer';

import ToSRenderer from './views/ToS/renderer';

import PrivacyRenderer from './views/privacy/renderer';

import AboutRenderer from './views/about/renderer';

import ContactRenderer from './views/contact/renderer';

import MyShiftsRenderer from './views/myshifts/renderer';

import SystemRenderer from './views/system/renderer';

import './global.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<RenderProvider>
				<ConsentProvider>
					<ThemeProvider>
						<AuthProvider>
							<Routes>
								<Route
									path="/"
									element={
										<UnAuthWrapper>
											<Index />
										</UnAuthWrapper>
									}
								/>
								<Route
									path="/offline"
									element={<OfflineRenderer />}
								/>
								<Route
									path="/ToS"
									element={<ToSRenderer />}
								/>
								<Route
									path="/Privacy"
									element={<PrivacyRenderer />}
								/>
								<Route
									path="/About"
									element={<AboutRenderer />}
								/>
								<Route
									path="/Contact"
									element={<ContactRenderer />}
								/>
								<Route
									path="/login"
									element={
										<UnAuthWrapper>
											<Login />
										</UnAuthWrapper>
									}
								/>
								<Route
									path="/bug-report"
									element={<BugreportRenderer />}
								/>
								<Route
									path="/resetPassword"
									element={
										<UnAuthWrapper>
											<ResetPass />
										</UnAuthWrapper>
									}
								/>
								<Route
									path="/setpass"
									element={
										<UnAuthWrapper>
											<SetPass />
										</UnAuthWrapper>
									}
								/>
								<Route
									path="/forgotpass"
									element={
										<UnAuthWrapper>
											<ForgotPass />
										</UnAuthWrapper>
									}
								/>
								<Route
									path="/serverinfo"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<ServerInfo />
										</AuthWrapper>
									}
								/>
								<Route
									path="/invite"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<Invite />
										</AuthWrapper>
									}
								/>
								<Route
									path="/tables"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<TableRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/system"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<SystemRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/manage-users"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<ManageUsers />
										</AuthWrapper>
									}
								/>
								<Route
									path="/user/:uuid"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<UserDetail />
										</AuthWrapper>
									}
								/>
								<Route
									path="/schedule"
									element={
										<AuthWrapper
											allowedUserRoles={['admin', 'worker', 'maintainer']}>
											<Schedule />
										</AuthWrapper>
									}
								/>
								<Route
									path="/apply-unassigned"
									element={
										<AuthWrapper allowedUserRoles={['worker']}>
											<ApplyUnassigned />
										</AuthWrapper>
									}
								/>
								<Route
									path="/myshifts"
									element={
										<AuthWrapper allowedUserRoles={['worker']}>
											<MyShiftsRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/assign-shifts"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<AssignShifts />
										</AuthWrapper>
									}
								/>
								<Route
									path="/create-schedule"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<CreateSchedule />
										</AuthWrapper>
									}
								/>
								<Route
									path="/handle-shifts"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<ShiftRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/handle-template"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<TemplateRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/create-template"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<CreateTemplate />
										</AuthWrapper>
									}
								/>
								<Route
									path="/server-panel"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<ServerPanel />
										</AuthWrapper>
									}
								/>
								<Route
									path="/email-status"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<EmailStatus />
										</AuthWrapper>
									}
								/>
								<Route
									path="/welcome"
									element={
										<AuthWrapper
											allowedUserRoles={['admin', 'worker', 'maintainer']}>
											<Welcome />
										</AuthWrapper>
									}
								/>
								<Route
									path="/handle-groups"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<GroupRenderer />
										</AuthWrapper>
									}
								/>
								<Route
									path="/handle-status"
									element={
										<AuthWrapper allowedUserRoles={['admin', 'maintainer']}>
											<StatusMsg />
										</AuthWrapper>
									}
								/>
								<Route
									path="/calendarlink"
									element={
										<AuthWrapper
											allowedUserRoles={['admin', 'worker', 'maintainer']}>
											<CalendarLink />
										</AuthWrapper>
									}
								/>
								<Route
									path="/logout"
									element={
										<AuthWrapper>
											<Logout />
										</AuthWrapper>
									}
								/>
								<Route
									path="*"
									element={<NotFound />}
								/>
							</Routes>
						</AuthProvider>
					</ThemeProvider>
				</ConsentProvider>
			</RenderProvider>
		</BrowserRouter>
	</StrictMode>
);