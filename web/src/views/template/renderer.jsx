import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import ModifyTemplate from './ModifyTemplate';

import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FaRegEdit } from 'react-icons/fa';

function TemplateRenderer() {
	const [viewState, setViewState] = useState('list'); // 'list' or 'edit'
	const [editingTemplate, setEditingTemplate] = useState(null);
	const [templateMeta, setTemplateMeta] = useState([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newTemplate, setNewTemplate] = useState({ name: '', private: false });

	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	// Fetch template metadata
	const fetchTemplateMeta = async () => {
		if (!user?.uuid) return;
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/getTemplateMeta?user_id=${user.uuid}`
			);
			const data = await response.json();
			setTemplateMeta(data.template_meta);
		} catch (error) {
			console.error('Error fetching template meta:', error);
		}
	};

	// Create a new template
	const createTemplateMeta = async () => {
		try {
			await fetch(import.meta.env.VITE_BASE_ADDR + '/createTemplateMeta', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					creator_id: user.uuid,
					...newTemplate,
				}),
			});
			fetchTemplateMeta();
			setIsDialogOpen(false);
			setNewTemplate({ name: '', private: false });
		} catch (error) {
			console.error('Error creating template meta:', error);
		}
	};

	useEffect(() => {
		fetchTemplateMeta();
	}, [user]);

	// Switch to edit mode
	const handleEdit = (templateId) => {
		setEditingTemplate(templateId);
		setViewState('edit');
	};

	// Go back to template list
	const handleBack = () => {
		setViewState('list');
		setEditingTemplate(null);
	};

	// **EDIT MODE** - Show ModifyTemplate
	if (viewState === 'edit' && editingTemplate) {
		return (
			<ModifyTemplate
				templateId={editingTemplate}
				onClose={handleBack}
			/>
		);
	}

	// **DEFAULT MODE** - Show Template List + Create Template Dialog
	return (
		<Layout>
			<div className="max-w-4xl mx-auto p-8">
				<h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
					Templates
				</h2>

				{/* Template List */}
				<ul className="bg-transparent hover:bg-transparent shadow-sm rounded-lg p-4 space-y-2 w-1/2">
					{templateMeta.length > 0 ? (
						templateMeta.map((template) => (
							<li
								key={template.template_id}
								className="border-b border-gray-300 dark:border-white py-2 last:border-none text-gray-800 dark:text-gray-300 flex justify-between items-center">
								<div>
									<span className="font-medium">{template.name}</span>{' '}
									<span
										className={`ml-2 ${
											template.private ? 'text-red-500' : 'text-green-500'
										}`}>
										{template.private ? '(Private)' : '(Public)'}
									</span>
								</div>

								{/* Edit Button */}
								<Button
									className="bg-transparent hover:bg-transparent hover:text-gray-600 text-white px-3 py-1 rounded"
									onClick={() => handleEdit(template.template_id)}>
									<FaRegEdit
										className=""
										style={{
											width: '18px',
											height: '18px',
										}}
									/>
								</Button>
							</li>
						))
					) : (
						<li className="text-gray-600 dark:text-gray-400">
							No templates available.
						</li>
					)}
				</ul>

				{/* Create Template - Dialog Button */}
				<div className="mt-6">
					<Dialog
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
								Create New Template
							</Button>
						</DialogTrigger>

						{/* Dialog Content */}
						<DialogContent className="bg-transparent hover:bg-transparent rounded-lg shadow-lg">
							<DialogHeader>
								<DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-200">
									Create New Template
								</DialogTitle>
								<DialogDescription className="text-gray-500 dark:text-gray-400">
									Enter details for the new template.
								</DialogDescription>
							</DialogHeader>

							{/* Input Fields */}
							<div className="flex flex-col space-y-4">
								<Input
									type="text"
									placeholder="Template Name"
									value={newTemplate.name}
									onChange={(e) =>
										setNewTemplate({ ...newTemplate, name: e.target.value })
									}
									className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent hover:bg-transparent text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>

								{/* Checkbox for Private/Public */}
								<div className="flex items-center space-x-2">
									<Checkbox
										id="privateCheckbox"
										checked={newTemplate.private}
										onCheckedChange={(checked) =>
											setNewTemplate({ ...newTemplate, private: checked })
										}
									/>
									<label
										htmlFor="privateCheckbox"
										className="text-gray-700 dark:text-gray-300">
										Private
									</label>
								</div>
							</div>

							{/* Create Button Inside Dialog */}
							<Button
								onClick={createTemplateMeta}
								className="mt-4 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
								Create Template
							</Button>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</Layout>
	);
}

export default TemplateRenderer;
