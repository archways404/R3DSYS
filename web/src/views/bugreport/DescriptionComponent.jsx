export default function DescriptionComponent() {
	return (
		<div>
			<p className="font-semibold">Step 1: Describe the Bug</p>
			<textarea
				placeholder="Describe the issue..."
				className="w-full p-2 border rounded"
			/>
		</div>
	);
}
