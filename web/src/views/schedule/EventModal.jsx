import React from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EventModal({ isOpen, onClose, onSubmit, onDelete, event }) {
	const [title, setTitle] = React.useState(event?.title || '');
	const [start, setStart] = React.useState(event?.start || '');
	const [end, setEnd] = React.useState(event?.end || '');
	const [description, setDescription] = React.useState(
		event?.description || ''
	);

	React.useEffect(() => {
		// Pre-fill form when editing an event
		setTitle(event?.title || '');
		setStart(event?.start || '');
		setEnd(event?.end || '');
		setDescription(event?.description || '');
	}, [event]);

	const handleSubmit = () => {
		if (!title || !start || !end) {
			alert('Please fill in all required fields');
			return;
		}

		onSubmit({
			...event,
			title,
			start,
			end,
			description,
		});
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					{/* Title Field */}
					<div className="flex flex-col">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							placeholder="Enter event title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>

					{/* Start Time Field */}
					<div className="flex flex-col">
						<Label htmlFor="start">Start Time</Label>
						<Input
							id="start"
							type="datetime-local"
							value={start}
							onChange={(e) => setStart(e.target.value)}
						/>
					</div>

					{/* End Time Field */}
					<div className="flex flex-col">
						<Label htmlFor="end">End Time</Label>
						<Input
							id="end"
							type="datetime-local"
							value={end}
							onChange={(e) => setEnd(e.target.value)}
						/>
					</div>

					{/* Description Field */}
					<div className="flex flex-col">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							placeholder="Enter event description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="secondary"
						onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}>
						{event ? 'Update' : 'Create'}
					</Button>
					{event && (
						<Button
							variant="destructive"
							onClick={() => onDelete(event?.id)}>
							Delete
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default EventModal;
