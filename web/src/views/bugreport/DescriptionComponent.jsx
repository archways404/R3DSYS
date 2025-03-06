import { Textarea } from '@/components/ui/textarea';

export default function DescriptionComponent({ description, setDescription }) {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			<div>
				<Textarea
					placeholder="Clearly explain the issue..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>
		</div>
	);
}
