import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const UserInfo = ({ userInfo, onUpdate, loading, message, error }) => {
	const [formData, setFormData] = useState(userInfo);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onUpdate(formData);
	};

	return (
		<div className="space-y-4 p-4 rounded-lg shadow-sm">
			<form
				onSubmit={handleSubmit}
				className="space-y-4">
				<div>
					<Label>First</Label>
					<Input
						label="First Name"
						name="first_name"
						value={formData.first_name}
						onChange={handleChange}
						required
						className="w-full"
					/>
				</div>
				<div>
					<Label>Last</Label>
					<Input
						label="Last Name"
						name="last_name"
						value={formData.last_name}
						onChange={handleChange}
						required
						className="w-full"
					/>
				</div>
				<div>
					<Label>Email</Label>
					<Input
						label="Email"
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						className="w-full"
					/>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={loading}>
					{loading ? 'Updating...' : 'Save Changes'}
				</Button>
			</form>

			{/* Status Messages */}
			{message && <p className="mt-2 text-green-500">{message}</p>}
			{error && <p className="mt-2 text-red-500">{error}</p>}
		</div>
	);
};

export default UserInfo;
