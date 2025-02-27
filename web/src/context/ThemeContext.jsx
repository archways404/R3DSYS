import { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { ConsentContext } from './ConsentContext';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState('dark');

	const { consent } = useContext(ConsentContext);

	// Define all possible categories
	const allCategories = ['necessary', 'preferences', 'analytics'];

	// Use optional chaining with a fallback to false
	const permissionsObject = allCategories.reduce((acc, category) => {
		acc[category] = consent?.acceptedCategories?.includes(category) ?? false;
		return acc;
	}, {});

	// Load theme from the correct storage method
	useEffect(() => {
		let savedTheme;

		if (permissionsObject.preferences) {
			// Load from Cookies
			savedTheme = Cookies.get('theme');
		} else {
			// Load from LocalStorage
			savedTheme = localStorage.getItem('theme');
		}

		if (savedTheme) {
			setTheme(savedTheme);
			document.documentElement.classList.add(savedTheme);
		} else {
			document.documentElement.classList.add('dark');
		}
	}, [permissionsObject.preferences]); // Re-run when permissions change

	// Function to toggle theme and store in the correct place
	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';

		// Update state and document class
		setTheme(newTheme);
		document.documentElement.classList.remove(theme);
		document.documentElement.classList.add(newTheme);

		if (permissionsObject.preferences) {
			// Store in cookies
			Cookies.set('theme', newTheme, { expires: 365, sameSite: 'Strict' });
		} else {
			// Store in localStorage
			localStorage.setItem('theme', newTheme);
		}
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
