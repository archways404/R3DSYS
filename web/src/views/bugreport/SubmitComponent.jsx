import { Button } from '@/components/ui/button';

export default function SubmitComponent() {
	return (
		<div>
			<p className="font-semibold">Step 4: Submit Bug Report</p>
			<Button onClick={() => alert('Bug report submitted!')}>Submit</Button>
		</div>
	);
}
