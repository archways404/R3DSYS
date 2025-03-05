import { Input } from '@/components/ui/input';
import { SendIcon } from 'lucide-react';
import { useId } from 'react';

export default function EmailInputSubmit({ value, onChange, onSubmit }) {
	const id = useId();

	return (
		<div className="*:not-first:mt-2">
			<div className="relative">
				<Input
					id={id}
					className="pe-9"
					placeholder="Enter your email"
					type="email"
					value={value} // ✅ Keep state updated
					onChange={onChange} // ✅ Update email state
				/>
				<button
					type="submit" // ✅ Now triggers form submission
					onClick={onSubmit} // ✅ Call `onSubmit` when clicked
					className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Send Reset Link">
					<SendIcon
						size={16}
						aria-hidden="true"
					/>
				</button>
			</div>
		</div>
	);
}
