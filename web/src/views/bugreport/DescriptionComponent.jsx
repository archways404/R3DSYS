import { Textarea } from '@/components/ui/textarea';

export default function DescriptionComponent({ description, setDescription }) {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			<div className="p-3 border rounded-lg bg-transparent">
				<p className="font-semibold text-center mb-2">
					Your description should include the following information
				</p>
				<ul className="list-disc pl-5 text-sm text-gray-400">
					<li className="mb-2">
						<strong className="text-gray-300">
							A clear and concise description of the bug
						</strong>
					</li>
					<li className="mb-1">
						<strong className="text-gray-300">Desktop Information</strong> (if
						applicable)
					</li>
					<ul className="list-disc pl-5 mb-2">
						<li>
							<strong className="text-gray-300">OS</strong> (e.g., Windows 11,
							macOS Ventura)
						</li>
						<li>
							<strong className="text-gray-300">Browser</strong> (e.g., Chrome,
							Firefox, Safari)
						</li>
						<li>
							<strong className="text-gray-300">Version</strong> (e.g., Chrome
							110.0.5481.77)
						</li>
					</ul>
					<li className="mb-1">
						<strong className="text-gray-300">Smartphone Information </strong>
						(if applicable)
					</li>
					<ul className="list-disc pl-5 mb-2">
						<li>
							<strong className="text-gray-300">Device</strong> (e.g., iPhone 13,
							Samsung Galaxy S21)
						</li>
						<li>
							<strong className="text-gray-300">OS</strong> (e.g., iOS 17, Android
							12)
						</li>
						<li>
							<strong className="text-gray-300">Browser</strong> (e.g., Safari,
							Chrome, Samsung Internet)
						</li>
						<li>
							<strong className="text-gray-300">Version</strong> (e.g., Chrome
							110.0.5481.77)
						</li>
					</ul>
					<li className="mb-2">
						<strong className="text-gray-300">Additional Notes</strong> Any
						relevant error messages, or extra information.
					</li>
				</ul>
			</div>
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
