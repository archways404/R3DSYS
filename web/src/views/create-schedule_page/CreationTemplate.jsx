// CreationTemplate.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const CreationTemplate = ({ onSelectTemplate, goBack }) => {
	const { user } = useContext(AuthContext);
	const [templateMeta, setTemplateMeta] = useState([]);

	useEffect(() => {
		const fetchTemplateMeta = async () => {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getTemplateMetaForUser?user_id=${
						user.uuid
					}`
				);
				const data = await response.json();
				setTemplateMeta(data.template_meta);
			} catch (error) {
				console.error('Error fetching template meta:', error);
			}
		};

		fetchTemplateMeta();
	}, [user]);

	const handleTemplateSelect = (template) => {
		// Pass the selected template back to the parent.
		onSelectTemplate({
			id: template.template_id, // or whatever key holds the ID
			name: template.name,
		});
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen ">
				<h2 className="text-2xl font-semibold mb-6">Select a Template</h2>
				<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					{templateMeta.length === 0 ? (
						<p>No templates available.</p>
					) : (
						<ul className="space-y-2">
							{templateMeta.map((template) => (
								<li
									key={template.template_id}
									className="p-4 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
									onClick={() => handleTemplateSelect(template)}>
									<p>
										<strong>{template.name}</strong>
									</p>
									<p>{template.description}</p>
								</li>
							))}
						</ul>
					)}
					<button
						onClick={goBack}
						className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
						Back
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default CreationTemplate;
