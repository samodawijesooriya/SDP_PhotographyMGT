import { createContext, useState } from "react";
import { API_URL } from "../../config/config";

// Create context with default values
export const StoreContext = createContext({
    url: '',
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
    login: () => {},
    logout: () => {}
});

export const StoreContextProvider = ({ children }) => {
    // States
    const [url] = useState(API_URL);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Login function
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    // Context value
    const contextValue = {
        url,
        user,
        setUser,
        token,
        setToken,
        login,
        logout
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;