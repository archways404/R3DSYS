// src/components/EditShiftDialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EditShiftDialog = ({ open, onOpenChange, event }) => {
	if (!event) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="text-sm">
				<DialogHeader>
					<DialogTitle>Edit Shift</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					<p>
						<strong>Shift:</strong> {event.shift_type_long}
					</p>
					<p>
						<strong>Time:</strong> {event.start_time}–{event.end_time}
					</p>
					<p>
						<strong>Assigned:</strong>{' '}
						{event.assigned_user_first_name
							? `${event.assigned_user_first_name} ${event.assigned_user_last_name}`
							: 'Unassigned'}
					</p>
					{/* Add your form elements here if needed */}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EditShiftDialog;
