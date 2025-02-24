import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const TestHandleShifts = () => {
	const { user } = useContext(AuthContext);

	const [shiftTypes, setShiftTypes] = useState([]);
	const [templateMeta, setTemplateMeta] = useState([]);
	const [newShiftType, setNewShiftType] = useState({
		name_long: '',
		name_short: '',
	});
	const [newTemplate, setNewTemplate] = useState({ name: '', private: false });

	const fetchShiftTypes = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/getShiftTypes'
			);
			const data = await response.json();
			setShiftTypes(data.shift_types);
		} catch (error) {
			console.error('Error fetching shift types:', error);
		}
	};

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

	const createShiftType = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/createShiftType',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newShiftType),
				}
			);
			const data = await response.json();
			alert(data.message);
			fetchShiftTypes();
		} catch (error) {
			console.error('Error creating shift type:', error);
		}
	};

	const createTemplateMeta = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/createTemplateMeta',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						creator_id: user.uuid,
						...newTemplate,
					}),
				}
			);
			const data = await response.json();
			alert(data.message);
			fetchTemplateMeta();
		} catch (error) {
			console.error('Error creating template meta:', error);
		}
	};

	useEffect(() => {
		fetchShiftTypes();
		fetchTemplateMeta();
	}, [user]);

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto p-8">
				<h2 className="text-2xl font-semibold mb-4">Shift Types</h2>
				<ul className="bg-white shadow-sm rounded-lg p-4 space-y-2">
					{shiftTypes.length > 0 ? (
						shiftTypes.map((shift) => (
							<li
								key={shift.id}
								className="border-b py-2 last:border-none">
								<span className="font-medium">{shift.name_long}</span>{' '}
								<span className="text-gray-500">({shift.name_short})</span>
							</li>
						))
					) : (
						<li className="text-gray-600">No shift types available.</li>
					)}
				</ul>

				<div className="mt-6">
					<h3 className="text-xl font-medium mb-2">Create New Shift Type</h3>
					<div className="flex space-x-4">
						<input
							type="text"
							placeholder="Long Name"
							value={newShiftType.name_long}
							onChange={(e) =>
								setNewShiftType({ ...newShiftType, name_long: e.target.value })
							}
							className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<input
							type="text"
							placeholder="Short Name"
							value={newShiftType.name_short}
							onChange={(e) =>
								setNewShiftType({ ...newShiftType, name_short: e.target.value })
							}
							className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						onClick={createShiftType}
						className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
						Create Shift Type
					</button>
				</div>

				<h2 className="text-2xl font-semibold mt-8 mb-4">Templates</h2>
				<ul className="bg-white shadow-sm rounded-lg p-4 space-y-2">
					{templateMeta.length > 0 ? (
						templateMeta.map((template) => (
							<li
								key={template.id}
								className="border-b py-2 last:border-none">
								<span className="font-medium">{template.name}</span>{' '}
								<span
									className={`ml-2 ${
										template.private ? 'text-red-500' : 'text-green-500'
									}`}>
									{template.private ? '(Private)' : '(Public)'}
								</span>
							</li>
						))
					) : (
						<li className="text-gray-600">No templates available.</li>
					)}
				</ul>

				<div className="mt-6">
					<h3 className="text-xl font-medium mb-2">Create New Template</h3>
					<div className="flex flex-col space-y-4">
						<input
							type="text"
							placeholder="Template Name"
							value={newTemplate.name}
							onChange={(e) =>
								setNewTemplate({ ...newTemplate, name: e.target.value })
							}
							className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<div className="flex items-center">
							<input
								type="checkbox"
								checked={newTemplate.private}
								onChange={(e) =>
									setNewTemplate({ ...newTemplate, private: e.target.checked })
								}
								className="mr-2"
							/>
							<span className="text-gray-700">Private</span>
						</div>
					</div>
					<button
						onClick={createTemplateMeta}
						className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
						Create Template
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default TestHandleShifts;
