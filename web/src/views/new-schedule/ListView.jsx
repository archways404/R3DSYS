// ListView.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Temporal } from '@js-temporal/polyfill';

function getShiftColorStyle(shiftType) {
	const base = shiftType.slice(0, -1);
	let hash = 0;
	for (let i = 0; i < base.length; i++) {
		hash = base.charCodeAt(i) + ((hash << 5) - hash);
	}

	const baseHue = Math.abs(hash) % 360;
	const variantChar = shiftType[shiftType.length - 1];
	const variantIndex = variantChar.charCodeAt(0) % 6;
	const hueOffset = (variantIndex - 3) * 10;
	const lightnessOffset = (variantIndex - 3) * 8;

	const h = (baseHue + hueOffset + 360) % 360;
	const s = 70;
	const baseL = 35;
	const l = Math.max(10, Math.min(85, baseL + lightnessOffset));

	return { borderColor: `hsl(${h}, ${s}%, ${l}%)` };
}

const ListView = ({ events }) => {
	const sortedDates = Object.keys(events).sort();

	// Intl formatter for "Monday, April 7th"
	const formatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	return (
		<div className="w-full max-w-[800px] space-y-6">
			{sortedDates.map((date) => {
				const temporalDate = Temporal.PlainDate.from(date);
				const jsDate = new Date(`${date}T00:00:00`);
				const formatted = formatter.format(jsDate); // "Monday, April 7"
				const displayDate = `${formatted} (${temporalDate.toString()})`;

				return (
					<div
						key={date}
						className="space-y-2">
						<h2 className="text-lg font-bold text-white flex items-baseline gap-2">
							<span>{formatted}</span>
							<span className="text-sm text-gray-400">({temporalDate.toString()})</span>
						</h2>
						{events[date].map((event, idx) => {
							const timeRange = `${event.start_time.slice(0, 5)} – ${event.end_time.slice(0, 5)}`;
							const { borderColor } = getShiftColorStyle(event.shift_type_short);
							const assignedTo = event.assigned_user_first_name
								? `${event.assigned_user_first_name} ${event.assigned_user_last_name}`
								: '-';

							return (
								<Card
									key={idx}
									style={{ border: `1.5px solid ${borderColor}` }}
									className="bg-transparent text-white p-2 shadow-sm">
									<CardContent className="p-2 text-sm flex items-center gap-2 flex-wrap">
										<span className="opacity-80">{timeRange}</span>
										<span className="font-semibold">{event.shift_type_short}</span>
										<span className="ml-auto opacity-90">{assignedTo}</span>
									</CardContent>
								</Card>
							);
						})}
					</div>
				);
			})}
		</div>
	);
};

export default ListView;
