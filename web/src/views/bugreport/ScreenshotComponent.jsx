import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';

export default function ScreenshotComponent({ images, setImages }) {
	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-lg">Upload Screenshots</h2>
			<p className="text-sm text-gray-500">
				Please provide relevant screenshots to help understand the issue.
			</p>
			<FileUpload onChange={setImages} />
		</div>
	);
}
