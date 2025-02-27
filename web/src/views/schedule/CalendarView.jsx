import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useState, useContext } from 'react';
import EventModal from './EventModal';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import svLocale from '@fullcalendar/core/locales/sv';
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from '@/components/ui/hover-card';
import { AuthContext } from '../../context/AuthContext';

import { GoDot } from 'react-icons/go';
import { GoDotFill } from 'react-icons/go';

function CalendarView({ events, onEventSubmit, onDeleteEvent }) {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	const { user } = useContext(AuthContext);

	console.log('events', events);

	function getCurrentTime() {
		const now = new Date();
		let hours = now.getHours();
		const minutes = now.getMinutes();

		if (minutes >= 30) {
			hours += 1;
		}

		if (hours === 24) {
			hours = 0;
		}

		const formattedHours = String(hours).padStart(2, '0');
		return `${formattedHours}:00:00`;
	}

	// Handle creating new event
	const handleDateSelect = (selectInfo) => {
		setSelectedEvent({
			id: String(Date.now()),
			start: selectInfo.startStr,
			end: selectInfo.endStr,
			allDay: selectInfo.allDay,
		});
		setModalOpen(true);
	};

	// Handle clicking on an existing event
	const handleEventClick = (clickInfo) => {
		setSelectedEvent({
			id: clickInfo.event.id,
			title: clickInfo.event.title,
			start: clickInfo.event.startStr,
			end: clickInfo.event.endStr,
			description: clickInfo.event.extendedProps?.description || '',
		});
		setModalOpen(true);
	};

	// Function to render custom event content with HoverCard
	const renderEventContent = (eventInfo) => {
		const { extendedProps, start, end } = eventInfo.event;
		const assignedFirstName = extendedProps?.assignedUserFirstName || '';
		const assignedLastName = extendedProps?.assignedUserLastName || '';
		const assignedEmail = extendedProps?.assignedUserEmail || '';
		const assignedTo = extendedProps?.assignedTo;

		// Format the date (YYYY-MM-DD)
		const eventDate = new Date(start).toISOString().split('T')[0];

		// Format time (HH:mm)
		const startTime = new Date(start).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
		const endTime = new Date(end).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});

		// Determine how to render the event title based on assignment
		let titleContent;
		if (!assignedTo) {
			// No assigned user: display title in red
			titleContent = (
				<span className="text-sm font-medium text-red-500">
					{eventInfo.event.title}
				</span>
			);
		} else if (assignedTo === user.uuid) {
			// Assigned to the current user: show green filled dot
			titleContent = (
				<span className="flex items-center text-sm font-medium text-gray-800 dark:text-gray-200">
					<GoDotFill className="text-green-500 mr-1" />
					{eventInfo.event.title}
				</span>
			);
		} else {
			// Assigned to someone else: show default dot
			titleContent = (
				<span className="flex items-center text-sm font-medium text-gray-800 dark:text-gray-200">
					<GoDot className="text-white mr-1" />
					{eventInfo.event.title}
				</span>
			);
		}

		return (
			<HoverCard>
				<HoverCardTrigger asChild>
					<div className="cursor-pointer block p-1 z-10">{titleContent}</div>
				</HoverCardTrigger>
				<HoverCardContent
					side="top" // Renders the popover above the element
					align="start" // Aligns the popover relative to the trigger
					sideOffset={2} // Provides spacing so it doesn't touch the title
					className="p-3 border border-gray-300 shadow-lg rounded-md w-[250px] z-[9999]">
					{/* Shift Title + Date */}
					<div className="flex justify-between items-center">
						<p className="text-sm font-semibold">
							{extendedProps.shiftTypeLong}
						</p>
						<p className="text-xs text-gray-500 whitespace-nowrap">
							{eventDate}
						</p>
					</div>

					{/* Time Range */}
					<p className="text-sm text-gray-400 whitespace-nowrap">
						{startTime} - {endTime}
					</p>

					{/* Assigned User */}
					{assignedTo ? (
						<p className="text-sm text-green-500">
							{assignedFirstName} {assignedLastName.charAt(0)}{' '}
							<span className="text-xs text-gray-500">({assignedEmail})</span>
						</p>
					) : (
						<p className="text-sm text-red-500">Unassigned</p>
					)}

					{/* Description */}
					{extendedProps?.description && (
						<p className="text-sm text-gray-600 truncate">
							<span className="font-semibold"></span>{' '}
							{extendedProps.description}
						</p>
					)}
				</HoverCardContent>
			</HoverCard>
		);
	};

	return (
		<div className="w-full h-[calc(100vh-200px)]">
			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				initialView="dayGridMonth"
				editable={true}
				selectable={true}
				selectMirror={true}
				dayMaxEvents={true}
				events={events}
				select={handleDateSelect}
				eventClick={handleEventClick}
				locale={enGbLocale}
				eventContent={renderEventContent} // Render hover effect on events
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
				}}
				views={{
					dayGridMonth: {
						firstDay: 1,
						titleFormat: { year: 'numeric', month: 'long' },
						dayHeaderFormat: { weekday: 'short' },
						weekNumbers: true,
					},
					timeGridWeek: {
						firstDay: 1,
						slotDuration: '00:30:00',
						slotLabelInterval: '01:00:00',
						slotMinTime: '06:00:00',
						slotMaxTime: '21:00:00',
						allDaySlot: false,
						expandRows: false,
						nowIndicator: true,
						scrollTime: getCurrentTime(),
					},
					timeGridDay: {
						firstDay: 1,
						slotDuration: '00:30:00',
						slotMinTime: '06:00:00',
						slotMaxTime: '22:00:00',
						allDaySlot: false,
						scrollTime: getCurrentTime(),
					},
					listWeek: {
						firstDay: 1,
						listDayFormat: false,
						listDaySideFormat: { weekday: 'short', day: 'numeric' },
						scrollTime: getCurrentTime(),
					},
				}}
			/>
			{/* Event Modal */}
			{user?.role === 'admin' && (
				<EventModal
					isOpen={isModalOpen}
					event={selectedEvent}
					onClose={() => setModalOpen(false)}
					onSubmit={(event) => {
						onEventSubmit(event);
						setModalOpen(false);
					}}
					onDelete={() => {
						onDeleteEvent(selectedEvent.id);
						setModalOpen(false);
					}}
				/>
			)}
		</div>
	);
}

export default CalendarView;