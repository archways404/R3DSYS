// ViewModeSwitcher.jsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { CalendarDays } from 'lucide-react';
import { List } from 'lucide-react';

const ViewModeSwitcher = ({ viewMode, setViewMode }) => {
	return (
		<ToggleGroup
			type="single"
			value={viewMode}
			onValueChange={(value) => value && setViewMode(value)}
			className="mb-4">
			<ToggleGroupItem value="calendar">
				<CalendarDays />
			</ToggleGroupItem>
			<ToggleGroupItem value="list">
				<List />
			</ToggleGroupItem>
		</ToggleGroup>
	);
};

export default ViewModeSwitcher;
