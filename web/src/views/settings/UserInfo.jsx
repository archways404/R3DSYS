import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const UserInfo = ({ userInfo, onUpdate, loading, message, error }) => {
	const [formData, setFormData] = useState(userInfo);
	const [validationError, setValidationError] = useState(null);
	const [hasChanges, setHasChanges] = useState(false);

	// ✅ Check if any changes are made
	useEffect(() => {
		const isDifferent = Object.keys(userInfo).some(
			(key) => userInfo[key]?.trim() !== formData[key]?.trim()
		);
		setHasChanges(isDifferent);
	}, [formData, userInfo]);

	// ✅ Validate Input on Form Submission
	const validateForm = () => {
		for (const [key, value] of Object.entries(formData)) {
			const trimmedValue = value.trim();

			// ✅ Name Validation (first_name, last_name) - Only a-z, åäö
			if (key === 'first_name' || key === 'last_name') {
				if (!/^[a-zA-ZåäöÅÄÖ]+$/.test(trimmedValue)) {
					setValidationError(`${key.replace('_', ' ')} must only contain letters (a-z, åäö).`);
					return false;
				}
			}

			// ✅ Email Validation
			if (key.includes('email')) {
				if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(trimmedValue)) {
					setValidationError(`${key.replace('_', ' ')} must be a valid email address.`);
					return false;
				}
			}

			// ✅ Prevent Empty Fields
			if (trimmedValue.length === 0) {
				setValidationError(`${key.replace('_', ' ')} cannot be empty.`);
				return false;
			}
		}

		setValidationError(null);
		return true;
	};

	// ✅ Handle Input Change & Detect Differences
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updatedData = { ...prev, [name]: value };
			setHasChanges(
				Object.keys(userInfo).some((key) => userInfo[key]?.trim() !== updatedData[key]?.trim())
			);
			return updatedData;
		});
	};

	// ✅ Handle Form Submission (Validate Before Submitting)
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validateForm()) return; // ❌ Stop if validation fails

		// ✅ Trim whitespace before sending data
		const cleanedData = Object.fromEntries(
			Object.entries(formData).map(([key, value]) => [key, value.trim()])
		);

		onUpdate(cleanedData);
	};

	return (
		<div className="space-y-4 p-4 rounded-lg shadow-sm">
			<form
				onSubmit={handleSubmit}
				className="space-y-4">
				<div>
					<Label>First Name</Label>
					<Input
						name="first_name"
						value={formData.first_name}
						onChange={handleChange}
						required
						className="w-full"
					/>
				</div>
				<div>
					<Label>Last Name</Label>
					<Input
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
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						required
						className="w-full"
					/>
				</div>
				<div>
					<Label>Notification Email</Label>
					<Input
						type="email"
						name="notification_email"
						value={formData.notification_email}
						onChange={handleChange}
						className="w-full"
					/>
				</div>
				<div>
					<Label>Teams Email</Label>
					<Input
						type="email"
						name="teams_email"
						value={formData.teams_email}
						onChange={handleChange}
						className="w-full"
					/>
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={!hasChanges || loading} // ✅ Disabled if no changes
				>
					{loading ? 'Updating...' : 'Save Changes'}
				</Button>
			</form>

			{/* ✅ Display Validation Errors */}
			{validationError && <p className="mt-2 text-red-500">{validationError}</p>}
			{message && <p className="mt-2 text-green-500">{message}</p>}
			{error && <p className="mt-2 text-red-500">{error}</p>}
		</div>
	);
};

export default UserInfo;
