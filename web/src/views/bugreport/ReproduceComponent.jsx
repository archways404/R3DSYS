import { Textarea } from '@/components/ui/textarea';

export default function ReproduceComponent({ reproduce, setReproduce }) {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			<div>
				<Textarea
					placeholder="Step by step instructions on how to reproduce the issue"
					value={reproduce}
					onChange={(e) => setReproduce(e.target.value)}
				/>
			</div>
		</div>
	);
}
