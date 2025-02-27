// CreationCalendar.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useContext, useState, useEffect } from 'react';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EventDialog from './EventDialog';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';

// Helper function to get current time in HH:MM:SS format.
function getCurrentTime() {
	const now = new Date();
	return now.toTimeString().split(' ')[0];
}

function CreationCalendar({
	selectedTemplate,
	selectedGroup,
	selectedYear,
	selectedMonth,
}) {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	const [events, setEvents] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [currentEvent, setCurrentEvent] = useState(null);
	const [shiftTypes, setShiftTypes] = useState([]); // New state for shift types

	// Fetch shift types once on mount.
	useEffect(() => {
		fetch(`${import.meta.env.VITE_BASE_ADDR}/getShiftTypes`)
			.then((res) => res.json())
			.then((data) => {
				// Assuming the API returns { shift_types: [ ... ] }
				setShiftTypes(data.shift_types);
			})
			.catch((err) => console.error('Error fetching shift types:', err));
	}, []);

	useEffect(() => {
		fetchEvents();
	}, [
		user,
		selectedTemplate,
		selectedGroup,
		selectedYear,
		selectedMonth,
		toast,
	]);

	const fetchEvents = async () => {
		if (
			!user ||
			!selectedTemplate ||
			!selectedGroup ||
			!selectedYear ||
			!selectedMonth
		)
			return;
		try {
			const url = `${import.meta.env.VITE_BASE_ADDR}/applyTemplate`;
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					user_id: user.uuid,
					template_id: selectedTemplate.id,
					group_id: selectedGroup.id,
					year: selectedYear,
					month: selectedMonth,
				}),
			});
			const data = await response.json();
			setEvents(data);
		} catch (error) {
			console.error('Error fetching events:', error);
			toast({
				description: 'Error fetching events',
				variant: 'destructive',
			});
		}
	};

	// When an event is clicked, open the modal with that event’s data.
	const handleEventClick = (info) => {
		const event = info.event;
		const eventData = {
			id: event.id,
			title: event.title,
			start: event.startStr,
			end: event.endStr,
			extendedProps: event.extendedProps,
		};
		setCurrentEvent(eventData);
		setModalOpen(true);
	};

	// When a date/time selection is made (to create a new event).
	const handleDateSelect = (selectInfo) => {
		const dateStr = selectInfo.startStr; // e.g. "2025-03-03"
		const newEvent = {
			id: null, // Will be generated on save.
			title: '',
			start: dateStr + 'T09:00:00',
			end: dateStr + 'T17:00:00',
			extendedProps: { description: '' },
		};
		setCurrentEvent(newEvent);
		setModalOpen(true);
	};

	// Save an event (update existing or create new).
	const handleSaveEvent = (updatedEvent) => {
		setEvents((prevEvents) => {
			if (updatedEvent.id) {
				// Update existing event.
				return prevEvents.map((ev) =>
					ev.id === updatedEvent.id ? updatedEvent : ev
				);
			} else {
				// Create new event with a new UUID.
				updatedEvent.id = uuidv4();
				return [...prevEvents, updatedEvent];
			}
		});
	};

	// Delete an event.
	const handleDeleteEvent = (eventToDelete) => {
		setEvents((prevEvents) =>
			prevEvents.filter((ev) => ev.id !== eventToDelete.id)
		);
	};

	// Handler to submit events to the backend.
	const handleSubmitAllEvents = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/insertActiveShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(events),
				}
			);
			const result = await response.json();
			toast({
				description: 'Events submitted successfully!',
				variant: 'default',
			});
		} catch (error) {
			console.error('Error submitting events:', error);
			toast({
				description: 'Error submitting events',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="w-full h-[calc(100vh-200px)]">
			<FullCalendar
				key={`${selectedYear}-${selectedMonth}`}
				initialDate={`${selectedYear}-${String(selectedMonth).padStart(
					2,
					'0'
				)}-01`}
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				initialView="dayGridMonth"
				editable={true}
				selectable={true}
				selectMirror={true}
				dayMaxEvents={true}
				events={events}
				locale={enGbLocale}
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
						displayEventTime: false,
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
				eventClick={handleEventClick}
				select={handleDateSelect}
			/>

			{/* Button to submit all events */}
			<div className="mt-4 flex justify-center">
				<Button
					onClick={handleSubmitAllEvents}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
					Submit Events
				</Button>
			</div>

			{/* Modal for editing/creating events */}
			<EventDialog
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				eventData={currentEvent}
				onSave={handleSaveEvent}
				onDelete={handleDeleteEvent}
				shiftTypes={shiftTypes}
				defaultGroupId={selectedGroup.id} // Pass default group id
				defaultGroupName={selectedGroup.name} // Pass default group name
			/>
		</div>
	);
}

export default CreationCalendar;
