import React, { createContext, useState, useContext } from 'react';

// Create the FavoritesContext
const FavoritesContext = createContext();

// FavoritesProvider component
export const FavoritesProvider = ({ children }) => {
    const [favoriteItems, setFavoriteItems] = useState(() => {
        try {
            const savedFavorites = localStorage.getItem('favoriteProducts');
            return savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return [];
        }
    });

    const addToFavorites = (item) => {
        if (!item || !item.id) {
            console.error("Invalid item added to favorites:", item);
            return;
        }
        setFavoriteItems((prevItems) => {
            if (!prevItems.find((fav) => fav.id === item.id)) {
                const updatedFavorites = [...prevItems, item];
                localStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
                return updatedFavorites;
            }
            return prevItems;
        });
    };

    const removeFromFavorites = (itemId) => {
        setFavoriteItems((prevItems) => {
            const updatedFavorites = prevItems.filter((item) => item.id !== itemId);
            localStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
            return updatedFavorites;
        });
    };

    return (
        <FavoritesContext.Provider value={{ favoriteItems, addToFavorites, removeFromFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Custom hook to use FavoritesContext
export const useFavorites = () => {
    return useContext(FavoritesContext);
};