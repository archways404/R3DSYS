import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FilePenLine } from 'lucide-react';
import EditShiftDialog from './EditShiftDialog';
import { Temporal } from '@js-temporal/polyfill';
import { Plus } from 'lucide-react';
import NewEntryComponent from './NewEntryComponent';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

	// Previous month
	const prevMonthDate = firstDay.subtract({ months: 1 });
	const lastDayOfPrevMonth = getLastDayOfMonth(prevMonthDate.year, prevMonthDate.month);

	const prevMonth = [];
	for (let i = daysBack - 1; i >= 0; i--) {
		prevMonth.push(lastDayOfPrevMonth.subtract({ days: i }));
	}

	// Current month
	const currMonth = [];
	for (let day = 1; day <= firstDay.daysInMonth; day++) {
		currMonth.push(Temporal.PlainDate.from({ year, month, day }));
	}

	// Next month
	const nextMonthDate = firstDay.add({ months: 1 });
	const nextMonth = [];
	for (let i = 1; i <= daysForward; i++) {
		nextMonth.push(
			Temporal.PlainDate.from({ year: nextMonthDate.year, month: nextMonthDate.month, day: i })
		);
	}

	return [...prevMonth, ...currMonth, ...nextMonth];
}

const Calendar = ({ month, year, events = {}, redDays = [], onScheduleUpdated }) => {
	const { user } = useContext(AuthContext);
	const days = fillCalendarGrid(year, month);
	const [newEntryOpen, setNewEntryOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState(null);

	const isRedDay = (date) => redDays.includes(date.toString());

	return (
		<div className="w-full max-w-[1300px] mx-auto">
			<div className="grid grid-cols-7 text-center text-white text-sm pb-2">
				{DAYS_OF_WEEK.map((day) => (
					<div
						key={day}
						className="font-semibold p-2">
						{day}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1 border-t border-gray-700">
				{days.map((day) => {
					const isCurrentMonth = day.month === month;
					const red = isRedDay(day);
					const isOpen = newEntryOpen && selectedDate === day.toString();

					return (
						<div
							key={day.toString()}
							className={`flex flex-col p-2 border border-gray-700 relative min-h-[120px] ${
								red
									? 'text-red-500 border-red-500 font-semibold'
									: isCurrentMonth
									? ''
									: 'text-gray-500'
							}`}>
							{/* Day number */}
							<div className="text-xs absolute top-1 left-1">{day.day}</div>

							{/* ➕ Plus button */}
							<button
								className="absolute top-1 right-1 p-0.5 hover:text-green-400"
								onClick={() => {
									setSelectedDate(day.toString());
									setNewEntryOpen(true);
								}}>
								<Plus size={14} />
							</button>

							{/* Mount NewEntryComponent ONLY when clicked */}
							{isOpen && (
								<NewEntryComponent
									open={newEntryOpen}
									onOpenChange={setNewEntryOpen}
									date={day.toString()}
									onCreated={onScheduleUpdated}
									groups={user?.groups || []}
								/>
							)}

							{/* Events */}
							<div className="mt-5 space-y-1 flex-1 overflow-hidden">
								{[...(events[day.toString()] || [])]
									.sort((a, b) => {
										// First, compare start_time
										if (a.start_time < b.start_time) return -1;
										if (a.start_time > b.start_time) return 1;

										// If start times are equal, put the longer one last (i.e., shorter one first)
										if (a.end_time < b.end_time) return -1;
										if (a.end_time > b.end_time) return 1;

										return 0;
									})
									.map((event, index) => (
										<EventCard
											key={index}
											event={event}
											onUpdated={onScheduleUpdated}
										/>
									))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

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

	const borderColor = `hsl(${h}, ${s}%, ${l}%)`;

	return { borderColor };
}

const EventCard = ({ event, onUpdated }) => {
	const [open, setOpen] = useState(false);
	const timeRange = `${event.start_time.slice(0, 5)}–${event.end_time.slice(0, 5)}`;
	const { borderColor } = getShiftColorStyle(event.shift_type_short);

	return (
		<TooltipProvider>
			<EditShiftDialog
				open={open}
				onOpenChange={setOpen}
				event={event}
				onUpdated={onUpdated}
			/>
			<Tooltip>
				<TooltipTrigger asChild>
					<Card
						style={{ border: `1.5px solid ${borderColor}` }}
						className="text-white text-xs rounded-md px-2 py-[2px] shadow-sm bg-transparent cursor-pointer">
						<CardContent className="p-0 flex justify-between items-center w-full gap-2">
							<span className="text-[11px] opacity-80 whitespace-nowrap">{timeRange}</span>
							<span className="truncate text-center flex-1 font-semibold">
								{event.shift_type_short}
							</span>
						</CardContent>
					</Card>
				</TooltipTrigger>
				<TooltipContent
					side="top"
					className="text-xs w-60">
					<div className="space-y-1 relative">
						<div className="flex justify-between items-center">
							<strong>{event.shift_type_long}</strong>
							<FilePenLine
								size={14}
								className="cursor-pointer hover:text-red-400"
								onClick={(e) => {
									e.stopPropagation();
									setOpen(true);
								}}
							/>
						</div>
						<div>{timeRange}</div>
						<div>
							<strong>
								{event.assigned_user_first_name
									? `${event.assigned_user_first_name} ${event.assigned_user_last_name}`
									: 'Unassigned'}
							</strong>
						</div>
						{event.assigned_user_email && (
							<div className="opacity-80">{event.assigned_user_email}</div>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default Calendar;
