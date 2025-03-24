import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    useEffect(() => {
        // Set up axios interceptor for authorization
        const token = user?.token;
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [user]);

    const login = (userData) => {
        // Set user data in state and localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set authorization header for axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    const logout = () => {
        return new Promise((resolve) => {
            // Clear user data from state and localStorage
            setUser(null);
            localStorage.removeItem('user');
            
            // Remove authorization header
            delete axios.defaults.headers.common['Authorization'];
            resolve();
        });
    };

    // Check if the token is still valid
    const isAuthenticated = () => {
        return !!user;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);