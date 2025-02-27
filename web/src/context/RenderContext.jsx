import { createContext, useState, useContext } from 'react';

// Create context
const RenderContext = createContext();

// StateProvider component
export const RenderProvider = ({ children }) => {
	const [renderLoading, setRenderLoading] = useState(false);

	return (
		<RenderContext.Provider value={{ renderLoading, setRenderLoading }}>
			{children}
		</RenderContext.Provider>
	);
};

// Custom hook to use the context
export const useStateContext = () => useContext(RenderContext);
