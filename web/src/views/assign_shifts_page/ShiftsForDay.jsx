import React from 'react';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

function ShiftsForDay({
	date,
	shifts,
	assignments,
	onAssignShift,
	onRemoveAssignment,
	onNext,
	onPrev,
}) {
	return (
		<div className="space-y-4">
			{/* Date Header with Navigation Buttons */}
			<div className="flex items-center justify-between py-3 px-5 rounded-md shadow-sm">
				<Button
					onClick={onPrev}
					disabled={!onPrev}>
					Previous
				</Button>
				<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide text-center">
					{new Intl.DateTimeFormat('en-US', {
						weekday: 'long',
						month: 'long',
						day: 'numeric',
					}).format(new Date(date))}
					<span className="text-sm font-normal text-gray-600 dark:text-gray-300 ml-2">
						({new Date(date).toLocaleDateString()})
					</span>
				</h3>
				<Button
					onClick={onNext}
					disabled={!onNext}>
					Next
				</Button>
			</div>

			{/* Shift Cards */}
			<div className="space-y-4 mt-2">
				{shifts.map((shift) => {
					const assignedUser = assignments.find(
						(a) => a.shift_id === shift.shift_id
					);
					const isAssigned = Boolean(assignedUser);
					const hasAvailablePeople = shift?.available_people?.length > 0;

					return (
						<div
							key={shift.shift_id}
							className={`p-4 rounded-lg shadow-md transition-all duration-300 border ${
								isAssigned
									? 'bg-green-500 text-white border-green-700' // Assigned shift: Green
									: hasAvailablePeople
									? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:shadow-lg' // Available: Default
									: 'bg-red-500 text-white border-red-700' // No available people: Red
							}`}>
							{/* Shift Info and Selection */}
							<div className="flex justify-between items-center w-full">
								<div>
									<p className="font-semibold text-lg">
										{shift.shift_type_short}
									</p>
									<p className="text-sm">
										{shift.start_time.slice(0, 5)} -{' '}
										{shift.end_time.slice(0, 5)}
									</p>
								</div>

								{/* Assigned User or Selection */}
								<div className="flex items-center gap-2">
									{isAssigned ? (
										<p className="text-sm font-medium">
											{assignedUser.first_name} {assignedUser.last_name} (
											{assignedUser.email})
										</p>
									) : hasAvailablePeople ? (
										<Combobox
											items={shift.available_people.map((user) => ({
												value: user.user_id,
												label: `${user.first_name} ${user.last_name} (${user.email})`,
											}))}
											placeholder="Select a user..."
											onChange={(value) => {
												const user = shift.available_people.find(
													(u) => u.user_id === value
												);
												if (user) {
													onAssignShift(shift.shift_id, user);
												}
											}}
											className="min-w-[200px]"
										/>
									) : (
										<p className="text-sm font-medium text-red-200">
											No available users
										</p>
									)}

									{/* Remove Assignment Button */}
									{isAssigned && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onRemoveAssignment(shift.shift_id)}
											className="text-red-500 hover:text-red-700">
											<Trash2 className="w-5 h-5" />
										</Button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default ShiftsForDay;
