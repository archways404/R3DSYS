// CreationMethod.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const CreateMethod = ({ setRenderMode }) => {
	const { user } = useContext(AuthContext);

	const handleTemplateClick = () => {
		// Update parent's render state to "template"
		setRenderMode('template');
	};

	const handleManualClick = () => {
		// Update parent's render state to "manual"
		setRenderMode('manual');
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen ">
				<h2 className="text-2xl font-semibold mb-6">Calendar</h2>
				<div className="flex space-x-6">
					<button
						onClick={handleTemplateClick}
						className="w-32 h-32 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
						Template
					</button>
					<button
						disabled
						onClick={handleManualClick}
						className="w-32 h-32 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
						Manual
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default CreateMethod;
