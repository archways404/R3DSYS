import { Textarea } from '@/components/ui/textarea';

export default function ExpectedBehaviorComponent({ expected, setExpected }) {
	return (
		<div className="space-y-4">
			{/* Instructions for Expected Behavior */}
			<div className="p-3 border rounded-lg bg-transparent">
				<p className="font-semibold text-center mb-2">
					How to Describe the Expected Behavior
				</p>
				<ul className="list-disc pl-5 text-sm text-gray-400">
					<li className="mb-2">
						<strong className="text-gray-300">
							Explain how the feature should work:
						</strong>{' '}
						Describe what should happen when following the steps in the bug
						report.
					</li>
					<li className="mb-2">
						<strong className="text-gray-300">Use clear examples:</strong>{' '}
						<pre className="bg-transparent p-2 rounded-md text-gray-300 text-xs mt-1">
							{`- After clicking "Submit," the user should be logged in and redirected
  to the dashboard.
- The button should change color when hovered over.
- Form validation should display an error message if the email is invalid.`}
						</pre>
					</li>
					<li className="mb-2">
						<strong className="text-gray-300">
							Compare to actual behavior:
						</strong>{' '}
						Mention how it differs from the current issue.
					</li>
					<li className="mb-2">
						<strong className="text-gray-300">Keep it concise:</strong> Focus on
						what should happen rather than implementation details.
					</li>
				</ul>
			</div>
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
