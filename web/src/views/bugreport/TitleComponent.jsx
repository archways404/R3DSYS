import InputCharlimit from '@/components/ui/InputCharlimit';

export default function TitleComponent({ title, setTitle }) {
	return (
		<div className="space-y-4">
			{/* Bug Description Input */}
			<InputCharlimit
				title={title}
				setTitle={setTitle}
			/>
		</div>
	);
}
