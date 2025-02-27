import React, { useState, useContext } from 'react';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { AuthContext } from '../../context/AuthContext';

const Invite = () => {
	const { user } = useContext(AuthContext);

	// Form states
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [role, setRole] = useState('worker'); // default role
	const [selectedGroups, setSelectedGroups] = useState([]); // Track selected groups

	// To track any errors or success messages
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Toggle group selection
	const toggleGroup = (groupId) => {
		setSelectedGroups(
			(prevGroups) =>
				prevGroups.includes(groupId)
					? prevGroups.filter((id) => id !== groupId) // Remove if already selected
					: [...prevGroups, groupId] // Add if not selected
		);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		const inviteData = {
			email: email,
			first_name: firstName,
			last_name: lastName,
			role: role,
			groups: selectedGroups, // Send selected groups
		};

		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/register',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(inviteData),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send invite.');
			}

			// Reset form and show success message
			setEmail('');
			setFirstName('');
			setLastName('');
			setRole('worker');
			setSelectedGroups([]); // Reset selected groups
			setSuccess('Invite sent successfully!');
			setError(null);
		} catch (err) {
			setError(err.message);
			setSuccess(null);
		}
	};

	return (
		<Layout>
			<div className="invite-form p-6 max-w-lg mx-auto bg-transparent dark:bg-transparent rounded-lg">
				<h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
					Send an Invite
				</h2>

				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					{/* Email Field */}
					<div>
						<Label
							htmlFor="email"
							className="text-gray-700 dark:text-gray-300">
							Email:
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="Enter email"
							className="mt-1"
						/>
					</div>

					{/* First Name Field */}
					<div>
						<Label
							htmlFor="firstName"
							className="text-gray-700 dark:text-gray-300">
							First Name:
						</Label>
						<Input
							id="firstName"
							type="text"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
							placeholder="Enter first name"
							className="mt-1"
						/>
					</div>

					{/* Last Name Field */}
					<div>
						<Label
							htmlFor="lastName"
							className="text-gray-700 dark:text-gray-300">
							Last Name:
						</Label>
						<Input
							id="lastName"
							type="text"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
							placeholder="Enter last name"
							className="mt-1"
						/>
					</div>

					{/* Role Selection */}
					<div>
						<Label
							htmlFor="role"
							className="text-gray-700 dark:text-gray-300">
							Role:
						</Label>
						<Select
							onValueChange={setRole}
							value={role}
							className="mt-1">
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="worker">Worker</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="maintainer">Maintainer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Group Selection */}
					<div>
						<Label className="text-gray-700 dark:text-gray-300">
							Assign Groups:
						</Label>
						<div className="flex flex-wrap gap-2 mt-2">
							{user.groups.map((group) => (
								<Button
									key={group.id}
									type="button"
									onClick={() => toggleGroup(group.id)}
									className={`border-2 px-4 py-2 ${
										selectedGroups.includes(group.id)
											? 'border-green-500 text-green-500' // ✅ Green outline when selected
											: 'border-white text-white' // ✅ Black outline when unselected
									}`}
									variant="ghost" // ✅ Ensures it doesn’t interfere with custom styles
								>
									{group.name}
								</Button>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-blue-500 dark:bg-blue-700 text-white">
						Send Invite
					</Button>
				</form>

				{/* Error and Success Messages */}
				{error && (
					<div className="error-message text-red-500 mt-4">{error}</div>
				)}
				{success && (
					<div className="success-message text-green-500 mt-4">{success}</div>
				)}
			</div>
		</Layout>
	);
};

export default Invite;
