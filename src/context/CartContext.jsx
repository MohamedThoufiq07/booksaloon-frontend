import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('booksaloon_cart');
        let parsed = savedCart ? JSON.parse(savedCart) : [];

        // Auto-repair IDs from numeric legacy cart items
        return parsed.map(item => {
            const rawId = item._id || item.id;
            if (rawId && (typeof rawId === 'number' || (typeof rawId === 'string' && rawId.length < 24))) {
                const base = "65d8f1e00000000000000000";
                const numStr = rawId.toString();
                const newId = base.slice(0, 24 - numStr.length) + numStr;
                return { ...item, _id: newId, id: newId };
            }
            return item;
        });
    });

    useEffect(() => {
        localStorage.setItem('booksaloon_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === product._id || item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    (item._id === product._id || item.id === product.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => (item._id !== productId && item.id !== productId)));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                (item._id === productId || item.id === productId)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
