import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';

export const FileUpload = ({ onChange }) => {
	const [files, setFiles] = useState([]);
	const fileInputRef = useRef(null);

	// ✅ Handles file selection & ensures only images are allowed
	const handleFileChange = (newFiles) => {
		const imageFiles = newFiles.filter((file) =>
			file.type.startsWith('image/')
		);
		const updatedFiles = [...files, ...imageFiles];

		setFiles(updatedFiles);
		onChange && onChange(updatedFiles); // ✅ Pass updated files to parent
	};

	// ✅ Handles file removal
	const handleRemoveFile = (index) => {
		const updatedFiles = files.filter((_, i) => i !== index);
		setFiles(updatedFiles);
		onChange && onChange(updatedFiles); // ✅ Update parent state
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const { getRootProps, isDragActive } = useDropzone({
		multiple: true,
		noClick: true,
		accept: 'image/*', // ✅ Accept only images
		onDrop: handleFileChange,
	});

	return (
		<div
			className="w-full"
			{...getRootProps()}>
			<motion.div
				onClick={handleClick}
				whileHover="animate"
				className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden">
				<input
					ref={fileInputRef}
					id="file-upload-handle"
					type="file"
					accept="image/*"
					multiple
					onChange={(e) => handleFileChange(Array.from(e.target.files))}
					className="hidden"
				/>
				{/* Upload Box */}
				<div className="flex flex-col items-center justify-center">
					<p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
						Upload file
					</p>
					<p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
						Drag or drop your files here or click to upload
					</p>
					<IconUpload className="h-6 w-6 text-gray-500 dark:text-gray-400 mt-2" />
				</div>
			</motion.div>

			{/* File List */}
			<div className="mt-4 space-y-2">
				{files.map((file, idx) => (
					<motion.div
						key={file.name}
						className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md shadow">
						{/* File Preview & Info */}
						<div className="flex items-center space-x-3">
							<img
								src={URL.createObjectURL(file)}
								alt={file.name}
								className="h-12 w-12 object-cover rounded-md"
							/>
							<div>
								<p className="text-sm text-gray-700 dark:text-gray-300">
									{file.name}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									{(file.size / (1024 * 1024)).toFixed(2)} MB
								</p>
							</div>
						</div>

						{/* Remove Button */}
						<button
							onClick={() => handleRemoveFile(idx)}
							className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600">
							<IconX className="h-4 w-4" />
						</button>
					</motion.div>
				))}
			</div>
		</div>
	);
};
