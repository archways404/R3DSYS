import { FileUpload } from '@/components/ui/file-upload';

export default function ScreenshotComponent() {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			<div>
				<FileUpload />
			</div>
		</div>
	);
}
