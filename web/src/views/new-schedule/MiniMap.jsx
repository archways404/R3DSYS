import { Calendar } from '@/components/ui/calendar';
import { Temporal } from '@js-temporal/polyfill';
import { enGB } from 'date-fns/locale'; // or sv
import { CircleHelp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MiniMap = ({ selectedDate, onSelect, month, year }) => {
	const currentMonth = Temporal.PlainDate.from({ year, month, day: 1 });
	return (
		<div className="bg-muted/10 p-4 rounded-xl border border-border mb-6">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="w-fit mx-auto cursor-pointer text-muted-foreground hover:text-foreground">
							<CircleHelp size={18} />
						</div>
					</TooltipTrigger>
					<TooltipContent
						side="left"
						className="text-xs">
						Click a date to scroll to that day in the schedule.
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Calendar
				mode="single"
				selected={selectedDate ? new Date(selectedDate) : undefined}
				onSelect={onSelect}
				showOutsideDays
				month={new Date(currentMonth.toString())} // This will correctly jump to current view
				className="[&>div>div>div:first-child]:hidden"
				locale={enGB}
			/>
		</div>
	);
};

export default MiniMap;
