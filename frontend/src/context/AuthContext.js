import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        // Here you'll integrate with your backend
        try {
            // Simulate API call
            const response = await mockLogin(email, password);
            setUser(response.user);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Mock function - replace with actual API call
const mockLogin = async (email, password) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: {
                    id: 1,
                    email,
                    name: 'Test User',
                },
            });
        }, 1000);
    });
};