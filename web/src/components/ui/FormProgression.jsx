import {
	Timeline,
	TimelineContent,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from '@/components/ui/timeline';
import { Check, X } from 'lucide-react';

export default function FormProgression({ steps, currentStep }) {
	return (
		<Timeline
			defaultValue={currentStep}
			className="relative">
			{steps.map((step, index) => (
				<TimelineItem
					key={step.id}
					step={step.id}
					className="relative ms-2 gap-24">
					{/* Timeline Vertical Line (Always Visible) */}
					{index !== steps.length - 1 && (
						<TimelineSeparator className="absolute left-3.5 top-7 bottom-0 w-1 bg-gray-500" />
					)}

					<TimelineHeader className="relative flex items-center">
						{/* Step Indicator (❌ for incomplete, ✅ for complete) */}
						<TimelineIndicator
							className={`flex size-8 items-center justify-center border-none rounded-full shadow-lg
								${
									step.completed
										? 'bg-green-500 text-white' // ✅ Green for completed
										: 'bg-gray-500 text-white' // ❌ Gray for incomplete
								}`}>
							{step.completed ? <Check size={18} /> : <X size={18} />}
						</TimelineIndicator>

						<TimelineTitle className="ml-8">{step.title}</TimelineTitle>
					</TimelineHeader>

					<TimelineContent className=""> </TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
}
