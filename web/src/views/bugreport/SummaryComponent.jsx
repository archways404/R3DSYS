import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function SummaryComponent({
	title,
	description,
	reproduce,
	expected,
	images,
}) {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-center">Bug Report Summary</h2>

			{/* Single Card for Entire Summary */}
			<Card className="p-6 shadow-md">
				<CardHeader className="text-xl font-semibold">Bug Report</CardHeader>
				<CardContent className="space-y-4">
					{/* Title */}
					<div>
						<p className="text-sm font-semibold text-gray-500">Title:</p>
						<p>{title || 'No title provided'}</p>
					</div>

					{/* Description */}
					<div>
						<p className="text-sm font-semibold text-gray-500">Description:</p>
						<p>{description || 'No description provided'}</p>
					</div>

					{/* Reproduction Steps */}
					<div>
						<p className="text-sm font-semibold text-gray-500">
							Reproduction Steps:
						</p>
						<p>{reproduce || 'No steps provided'}</p>
					</div>

					{/* Expected Behavior */}
					<div>
						<p className="text-sm font-semibold text-gray-500">
							Expected Behavior:
						</p>
						<p>{expected || 'No expected behavior provided'}</p>
					</div>

					{/* Screenshots */}
					<div>
						<p className="text-sm font-semibold text-gray-500">Screenshots:</p>
						{images.length > 0 ? (
							<div className="flex flex-wrap gap-4 mt-2">
								{images.map((image, index) => (
									<img
										key={index}
										src={URL.createObjectURL(image)}
										alt={`Screenshot ${index + 1}`}
										className="w-32 h-32 object-cover rounded-md shadow-md"
									/>
								))}
							</div>
						) : (
							<p>No screenshots uploaded</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
