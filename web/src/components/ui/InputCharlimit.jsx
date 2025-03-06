import { useCharacterLimit } from '@/hooks/use-character-limit';
import { Input } from '@/components/ui/input';
import { useId } from 'react';

export default function InputCharlimit({ title, setTitle, maxLength = 72 }) {
	const id = useId();

	// ✅ Correctly use the parent-provided title and setTitle function
	const {
		value,
		characterCount,
		handleChange,
		maxLength: limit,
	} = useCharacterLimit({
		maxLength,
		initialValue: title, // ✅ Sync initial value with parent
		setExternalValue: setTitle, // ✅ Allow updating parent state
	});

	return (
		<div className="*:not-first:mt-2">
			<div className="relative">
				<Input
					id={id}
					className="peer pe-14"
					type="text"
					value={value} // ✅ Use correct value
					maxLength={maxLength}
					onChange={handleChange} // ✅ Updates both internal & external state
					aria-describedby={`${id}-description`}
				/>
				<div
					id={`${id}-description`}
					className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-xs tabular-nums peer-disabled:opacity-50"
					aria-live="polite"
					role="status">
					{characterCount}/{limit}
				</div>
			</div>
		</div>
	);
}
