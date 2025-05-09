import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { LOGOUT_EVENT } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favoriteItems, setFavoriteItems] = useState(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return [];

        const savedFavorites = localStorage.getItem(`favorites_${userId}`);
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    const auth = useAuth();
    const isAuthenticated = auth?.isAuthenticated || false;

    // Oturum durumunu izle
    useEffect(() => {
        if (isAuthenticated) {
            loadFavorites();
        } else {
            clearFavorites();
        }
    }, [isAuthenticated]);

    // Logout event'ini dinle
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userId' && !e.newValue) {
                clearFavorites();
            }
            if (e.key === 'userId' && e.newValue) {
                const savedFavorites = localStorage.getItem(`favorites_${e.newValue}`);
                setFavoriteItems(savedFavorites ? JSON.parse(savedFavorites) : []);
            }
        };

        const handleLogout = () => {
            clearFavorites();
            const userId = localStorage.getItem('userId');
            if (userId) {
                localStorage.removeItem(`favorites_${userId}`);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(LOGOUT_EVENT, handleLogout);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(LOGOUT_EVENT, handleLogout);
        };
    }, []);

    const loadFavorites = useCallback(() => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const savedFavorites = localStorage.getItem(`favorites_${userId}`);
            if (savedFavorites) {
                setFavoriteItems(JSON.parse(savedFavorites));
            } else {
                setFavoriteItems([]);
            }
        } catch (error) {
            console.error("LocalStorage erişim hatası:", error);
            setFavoriteItems([]);
        }
    }, []);

    const saveFavoritesToStorage = useCallback((items) => {
        if (!isAuthenticated) return;

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            const minimalFavorites = items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image
            }));
            localStorage.setItem(`favorites_${userId}`, JSON.stringify(minimalFavorites));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                const userId = localStorage.getItem('userId');
                localStorage.removeItem(`favorites_${userId}`);
                try {
                    const minimalFavorites = items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image
                    }));
                    localStorage.setItem(`favorites_${userId}`, JSON.stringify(minimalFavorites));
                } catch (retryError) {
                    console.error('Favoriler kaydedilemedi:', retryError);
                }
            }
        }
    }, [isAuthenticated]);

    const clearFavorites = useCallback(() => {
        setFavoriteItems([]);
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.removeItem(`favorites_${userId}`);
        }
    }, []);

    const addToFavorites = useCallback((item) => {
        if (!isAuthenticated || !item?.id) return;

        setFavoriteItems(prevItems => {
            if (!prevItems.some(fav => fav.id === item.id)) {
                const updatedFavorites = [...prevItems, item];
                saveFavoritesToStorage(updatedFavorites);
                return updatedFavorites;
            }
            return prevItems;
        });
    }, [isAuthenticated, saveFavoritesToStorage]);

    const removeFromFavorites = useCallback((itemId) => {
        if (!isAuthenticated || !itemId) return;

        setFavoriteItems(prevItems => {
            const updatedFavorites = prevItems.filter(item => item.id !== itemId);
            saveFavoritesToStorage(updatedFavorites);
            return updatedFavorites;
        });
    }, [isAuthenticated, saveFavoritesToStorage]);

    const isFavorite = useCallback((itemId) => {
        return isAuthenticated && itemId ? favoriteItems.some(item => item.id === itemId) : false;
    }, [favoriteItems, isAuthenticated]);

    return (
        <FavoritesContext.Provider value={{
            favoriteItems,
            addToFavorites,
            removeFromFavorites,
            isFavorite,
            clearFavorites
        }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites hook FavoritesProvider içinde kullanılmalıdır');
    }
    return context;
};