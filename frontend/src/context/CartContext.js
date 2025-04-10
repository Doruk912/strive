// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return [];
        
        const savedCart = localStorage.getItem(`cart_${userId}`);
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [loading, setLoading] = useState(false);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
        }
    }, [cartItems]);

    // Clear cart when user logs out
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userId' && !e.newValue) {
                setCartItems([]);
            }
            if (e.key === 'userId' && e.newValue) {
                const savedCart = localStorage.getItem(`cart_${e.newValue}`);
                setCartItems(savedCart ? JSON.parse(savedCart) : []);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCart = async (product, quantity = 1, selectedSize = null) => {
        if (!selectedSize) {
            console.error('Size must be selected');
            return false;
        }

        const stockForSize = product.stocks?.find(stock => stock.size === selectedSize);
        if (!stockForSize || stockForSize.stock < quantity) {
            console.error('Not enough stock available for selected size');
            return false;
        }

        setLoading(true);
        try {
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => 
                    item.id === product.id && item.selectedSize === selectedSize
                );
                
                if (existingItem) {
                    const stockForSize = product.stocks.find(stock => stock.size === selectedSize);
                    const newQuantity = existingItem.quantity + quantity;
                    
                    if (newQuantity > stockForSize.stock) {
                        console.error('Not enough stock available for selected size');
                        return prevItems;
                    }

                    return prevItems.map(item =>
                        (item.id === product.id && item.selectedSize === selectedSize)
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                }
                return [...prevItems, { ...product, quantity, selectedSize }];
            });
            return true;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        setLoading(true);
        try {
            setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setLoading(true);
        try {
            if (quantity <= 0) {
                await removeFromCart(productId);
                return;
            }

            setCartItems(prevItems => {
                const item = prevItems.find(item => item.id === productId);
                if (!item) return prevItems;

                const totalStock = item.stocks?.reduce((total, stock) => total + (stock.stock || 0), 0) || 0;
                if (quantity > totalStock) {
                    console.error('Not enough stock available');
                    return prevItems;
                }

                return prevItems.map(item =>
                    item.id === productId
                        ? { ...item, quantity }
                        : item
                );
            });
        } finally {
            setLoading(false);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.removeItem(`cart_${userId}`);
        }
    };

    const getCartTotal = () => {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.18; // 18% tax
        const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
        
        return {
            subtotal,
            tax,
            shipping,
            total: subtotal + tax + shipping
        };
    };

    const getItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        loading
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};