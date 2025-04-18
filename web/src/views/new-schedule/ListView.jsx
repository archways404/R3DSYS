// ListView.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Temporal } from '@js-temporal/polyfill';
import { Plus } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

import NewEntryComponent from './NewEntryComponent';
import EditShiftDialog from './EditShiftDialog';
import MiniMap from './MiniMap';

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

function getFirstDayOfMonth(year, month) {
	return Temporal.PlainDate.from({ year, month, day: 1 });
}

function getLastDayOfMonth(year, month) {
	const firstDay = getFirstDayOfMonth(year, month);
	return firstDay.with({ day: firstDay.daysInMonth });
}

function daysBackToMonday(date) {
	return date.dayOfWeek - 1;
}

function daysForwardToSunday(date) {
	return 7 - date.dayOfWeek;
}

function fillCalendarGrid(year, month) {
	const firstDay = getFirstDayOfMonth(year, month);
	const lastDay = getLastDayOfMonth(year, month);

	const daysBack = daysBackToMonday(firstDay);
	const daysForward = daysForwardToSunday(lastDay);

	const prevMonthDate = firstDay.subtract({ months: 1 });
	const lastDayOfPrevMonth = getLastDayOfMonth(prevMonthDate.year, prevMonthDate.month);
	const prevMonth = [];
	for (let i = daysBack - 1; i >= 0; i--) {
		prevMonth.push(lastDayOfPrevMonth.subtract({ days: i }));
	}

	const currMonth = [];
	for (let day = 1; day <= firstDay.daysInMonth; day++) {
		currMonth.push(Temporal.PlainDate.from({ year, month, day }));
	}

	const nextMonthDate = firstDay.add({ months: 1 });
	const nextMonth = [];
	for (let i = 1; i <= daysForward; i++) {
		nextMonth.push(
			Temporal.PlainDate.from({ year: nextMonthDate.year, month: nextMonthDate.month, day: i })
		);
	}

	return [...prevMonth, ...currMonth, ...nextMonth];
}

const ListView = ({ events, month, year, redDays, onScheduleUpdated }) => {
	const { user } = useContext(AuthContext);
	const [openDate, setOpenDate] = useState(null);
	const [newEntryOpen, setNewEntryOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const dayRefs = useRef({});
	const [selectedMiniDate, setSelectedMiniDate] = useState(null);

	useEffect(() => {
		if (selectedMiniDate && dayRefs.current[selectedMiniDate]) {
			dayRefs.current[selectedMiniDate].scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	}, [selectedMiniDate]);

	const formatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	const days = fillCalendarGrid(year, month);

	const isRedDay = (date) => redDays.includes(date.toString());

	return (
		<div className="flex justify-center px-4">
			{/* Left side: Shift list */}
			<div className="relative flex justify-center px-4">
				<div className="w-fit space-y-8">
					{days.map((temporalDate) => {
						const iso = temporalDate.toString();
						const jsDate = new Date(`${iso}T00:00:00`);
						const formatted = formatter.format(jsDate);
						const dayEvents = events[iso] || [];
						const isOpen = newEntryOpen && openDate === iso;

						return (
							<div
								key={iso}
								ref={(el) => (dayRefs.current[iso] = el)}
								className={`space-y-4 bg-muted/10 p-4 rounded-xl border border-border ${
									temporalDate.month !== month ? 'opacity-50' : ''
								}`}>
								{/* Header with date and + button */}
								<div className="flex items-center justify-between pt-2 px-2 pb-4">
									<h2
										className={`text-lg font-bold flex items-baseline gap-2 ${
											isRedDay(temporalDate) ? 'text-red-500' : 'text-white'
										}`}>
										<span>{formatted}</span>
										<span className="text-sm text-gray-400">({iso})</span>
									</h2>
									{(user?.role === 'admin' || user?.role === 'maintainer') && (
										<>
											<button
												className="text-green-400 hover:text-green-300"
												onClick={() => {
													setOpenDate(iso);
													setNewEntryOpen(true);
												}}>
												<Plus size={18} />
											</button>
											{isOpen && (
												<NewEntryComponent
													open={newEntryOpen}
													onOpenChange={setNewEntryOpen}
													date={iso}
													onCreated={onScheduleUpdated}
													groups={user?.groups || []}
												/>
											)}
										</>
									)}
								</div>

								{/* Event cards */}
								{dayEvents.length > 0 ? (
									[...dayEvents]
										.sort((a, b) => {
											if (a.start_time < b.start_time) return -1;
											if (a.start_time > b.start_time) return 1;
											if (a.end_time < b.end_time) return -1;
											if (a.end_time > b.end_time) return 1;
											return 0;
										})
										.map((event, idx) => {
											const timeRange = `${event.start_time.slice(0, 5)} – ${event.end_time.slice(
												0,
												5
											)}`;
											const { borderColor } = getShiftColorStyle(event.shift_type_short);
											const assignedTo = event.assigned_user_first_name
												? `${event.assigned_user_first_name} ${event.assigned_user_last_name}`
												: '-';

											return (
												<div key={idx}>
													<Card
														style={{ border: `1.5px solid ${borderColor}` }}
														className="bg-transparent text-white p-2 shadow-sm cursor-pointer"
														onClick={() => {
															if (user?.role === 'admin' || user?.role === 'maintainer') {
																setEditingEvent(event);
																setEditDialogOpen(true);
															}
														}}>
														<CardContent className="p-2 text-sm flex items-center gap-2 flex-wrap">
															<span className="opacity-80">{timeRange}</span>
															<span className="font-semibold">{event.shift_type_short}</span>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<span className="ml-auto opacity-90">
																			{event.assigned_user_first_name
																				? `${
																						event.assigned_user_first_name
																				  } ${event.assigned_user_last_name.charAt(0)}`
																				: '-'}
																		</span>
																	</TooltipTrigger>
																	{event.assigned_user_first_name && (
																		<TooltipContent className="text-xs">
																			<div className="font-semibold">
																				{event.assigned_user_first_name}{' '}
																				{event.assigned_user_last_name}
																			</div>
																			<div className="text-gray-400">
																				{event.assigned_user_email}
																			</div>
																		</TooltipContent>
																	)}
																</Tooltip>
															</TooltipProvider>
														</CardContent>
													</Card>
													{editingEvent?.shift_id === event.shift_id && (
														<EditShiftDialog
															open={editDialogOpen}
															onOpenChange={setEditDialogOpen}
															event={editingEvent}
															onUpdated={onScheduleUpdated}
														/>
													)}
												</div>
											);
										})
								) : (
									<p className="text-sm px-2 text-gray-500 italic">No events</p>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Right side: MiniMap */}
			<div className="hidden lg:block fixed right-24 top-50 w-[280px] z-10">
				<MiniMap
					selectedDate={selectedMiniDate}
					onSelect={(date) => {
						if (date) {
							const temporalDate = Temporal.PlainDate.from({
								year: date.getFullYear(),
								month: date.getMonth() + 1,
								day: date.getDate(),
							});
							setSelectedMiniDate(temporalDate.toString());
						}
					}}
					month={month}
					year={year}
				/>
			</div>
		</div>
	);
};

export default ListView;