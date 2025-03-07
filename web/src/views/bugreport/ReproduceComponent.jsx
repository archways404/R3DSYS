import { Textarea } from '@/components/ui/textarea';

export default function ReproduceComponent({ reproduce, setReproduce }) {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			{/* Instructions for Writing Reproduction Steps */}
			<div className="p-3 border rounded-lg bg-transparent">
				<p className="font-semibold text-center mb-2">
					How to Write Clear Reproduction Steps
				</p>
				<ul className="list-disc pl-5 text-sm text-gray-400">
					<li className="mb-2">
						<strong className="text-gray-300">
							Provide a step-by-step guide:
						</strong>{' '}
						Start from opening the app/website and list actions leading to the
						bug.
					</li>
					<li className="mb-2">
						<strong className="text-gray-300">Use numbered steps:</strong>{' '}
						Example:
						<pre className="bg-transparent p-2 rounded-md text-gray-300 text-xs mt-1">
							{`1. Open the website at https://example.com
2. Click on the "Login" button
3. Enter valid credentials and press "Submit"
4. Notice that the page refreshes instead of logging in`}
						</pre>
					</li>
					<li className="mb-2">
						<strong className="text-gray-300">
							Expected vs Actual Behavior:
						</strong>{' '}
						Explain what should have happened and what actually occurred.
					</li>
				</ul>
			</div>
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
