import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const FilterComponent = ({
	user,
	activeGroups,
	setActiveGroups,
	showOnlyMine,
	setShowOnlyMine,
	availableShiftTypes,
	selectedShiftTypes,
	setSelectedShiftTypes,
}) => {
	const handleGroupToggle = (id) => {
		setActiveGroups((prev) => {
			const updated = new Set(prev);
			if (updated.has(id)) updated.delete(id);
			else updated.add(id);
			return updated;
		});
	};

	const handleShiftTypeToggle = (id) => {
		setSelectedShiftTypes((prev) => {
			const updated = new Set(prev);
			if (updated.has(id)) updated.delete(id);
			else updated.add(id);
			return updated;
		});
	};

	return (
		<div className="space-y-4 w-full max-w-4xl">
			<div className="flex flex-wrap gap-2 justify-center">
				{user?.groups?.map((group) => (
					<Button
						key={group.id}
						variant={activeGroups.has(group.id) ? 'default' : 'outline'}
						onClick={() => handleGroupToggle(group.id)}>
						{group.name}
					</Button>
				))}
			</div>

			<div className="flex justify-center items-center gap-2">
				<Checkbox
					id="mine"
					checked={showOnlyMine}
					onCheckedChange={(checked) => setShowOnlyMine(checked)}
				/>
				<label
					htmlFor="mine"
					className="text-white text-sm">
					Show only my shifts
				</label>
			</div>

			{availableShiftTypes.length > 0 && (
				<div className="flex flex-wrap gap-2 justify-center">
					{availableShiftTypes.map((type) => (
						<Button
							key={type.id}
							variant={selectedShiftTypes.has(type.id) ? 'default' : 'outline'}
							onClick={() => handleShiftTypeToggle(type.id)}>
							{type.name}
						</Button>
					))}
				</div>
			)}
		</div>
	);
};

export default FilterComponent;
