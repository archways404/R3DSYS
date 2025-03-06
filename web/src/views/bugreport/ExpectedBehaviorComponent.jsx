import { Textarea } from '@/components/ui/textarea';

export default function ExpectedBehaviorComponent({ expected, setExpected }) {
	return (
		<div className="space-y-4">
			<div>
				<Textarea
					placeholder="How did you expect it to work?"
					value={expected}
					onChange={(e) => setExpected(e.target.value)}
				/>
			</div>
		</div>
	);
}
