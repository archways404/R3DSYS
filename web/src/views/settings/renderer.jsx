import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import UserInfo from './UserInfo';
import UserGroups from './UserGroups';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

const SettingsRenderer = () => {
	const { user, updateUser, setUser } = useContext(AuthContext);
	const [userInfo, setUserInfo] = useState({
		first_name: user.first || '',
		last_name: user.last || '',
		email: user.email || '',
		notification_email: user.notification_email || '',
		teams_email: user.teams_email || '',
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	const handleUpdate = async (updatedData) => {
		setLoading(true);
		setMessage(null);
		setError(null);

		try {
			// Update request
			const response = await fetch(`${import.meta.env.VITE_BASE_ADDR}/updateUserInfo`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ ...updatedData, user_id: user.uuid }),
			});

			const data = await response.json();
			if (response.ok) {
				setMessage('Profile updated successfully.');
				setUserInfo(updatedData); // Update local UI immediately

				// Update `AuthContext` with new user info from response
				if (data.user) {
					setUser(data.user);
				}
			} else {
				setError(data.error || 'Failed to update profile.');
			}
		} catch (error) {
			setError('Network error while updating profile.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<div className="max-w-3xl mx-auto space-y-6 p-4">
				<Card className="p-6">
					<CardHeader className="border-b pb-4 mb-4">
						<h2 className="text-2xl text-center font-bold">Settings</h2>
					</CardHeader>
					<CardContent className="space-y-6">
						<UserGroups
							groups={user.groups}
							role={user.role}
						/>
						<UserInfo
							userInfo={userInfo}
							onUpdate={handleUpdate}
							loading={loading}
							message={message}
							error={error}
						/>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default SettingsRenderer;
