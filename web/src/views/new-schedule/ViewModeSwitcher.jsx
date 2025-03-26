// ViewModeSwitcher.jsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const ViewModeSwitcher = ({ viewMode, setViewMode }) => {
	return (
		<ToggleGroup
			type="single"
			value={viewMode}
			onValueChange={(value) => value && setViewMode(value)}
			className="mb-4">
			<ToggleGroupItem value="calendar">Calendar View</ToggleGroupItem>
			<ToggleGroupItem value="list">List View</ToggleGroupItem>
		</ToggleGroup>
	);
};

export default ViewModeSwitcher;
