import { useState, useEffect } from 'react';

export function useCharacterLimit({
	maxLength,
	initialValue = '',
	setExternalValue,
}) {
	const [value, setValue] = useState(initialValue);
	const [characterCount, setCharacterCount] = useState(initialValue.length);

	useEffect(() => {
		setValue(initialValue);
		setCharacterCount(initialValue.length);
	}, [initialValue]);

	const handleChange = (e) => {
		const newValue = e.target.value;
		if (newValue.length <= maxLength) {
			setValue(newValue);
			setCharacterCount(newValue.length);
			if (setExternalValue) setExternalValue(newValue); // ✅ Sync with parent state
		}
	};

	return {
		value,
		characterCount,
		handleChange,
		maxLength,
	};
}
