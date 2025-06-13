import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import { useAuth } from './AuthContextProvider';
import { useFeedback } from './FeedbackContext';

// Create context
const OrdersContext = createContext();

// Context provider component
export function OrdersContextProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const feedback = useFeedback();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
      }
    }
    
    // In future, you would load orders from Firebase here
    setLoading(false);
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  // Add item to cart
  const addToCart = (product) => {
    try {
      // Check if product is already in cart
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        // If product exists, increase quantity
        setCart(cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
        feedback?.showSuccess(`Added another ${product.name} to your cart`);
      } else {
        // If product doesn't exist, add it with quantity 1
        setCart([...cart, { ...product, quantity: 1 }]);
        feedback?.showSuccess(`${product.name} added to cart`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      feedback?.showError('Could not add item to cart');
    }
  };
  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    try {
      if (quantity < 1) return;
      
      const product = cart.find(item => item.id === productId);
      if (product) {
        setCart(cart.map(item => 
          item.id === productId ? { ...item, quantity: quantity } : item
        ));
        feedback?.showInfo(`Updated quantity for ${product.name}`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      feedback?.showError('Could not update quantity');
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    try {
      const product = cart.find(item => item.id === productId);
      if (product) {
        setCart(cart.filter(item => item.id !== productId));
        feedback?.showInfo(`${product.name} removed from cart`);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      feedback?.showError('Could not remove item from cart');
    }
  };

  // Clear cart
  const clearCart = () => {
    try {
      setCart([]);
      localStorage.removeItem('cart');
      feedback?.showInfo('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      feedback?.showError('Could not clear cart');
    }
  };

  // Calculate cart subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate number of items in cart
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };  // Load user orders from Firebase
  const loadOrders = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const q = query(
        collection(db, "orders"), 
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
      return ordersData;
    } catch (error) {
      console.error("Error loading orders:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
    // Load orders when user changes
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setError(null);
      
      loadOrders()
        .catch(err => {
          console.error("Error loading orders in useEffect:", err);
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setOrders([]);
    }
  }, [currentUser]);
  // Place new order
  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate that there are items in cart
      if (cart.length === 0) {
        const error = new Error("Cannot place an order with an empty cart");
        setError(error);
        feedback?.showError("Cannot place an order with an empty cart");
        throw error;
      }
      
      // Validate user is logged in
      if (!currentUser?.uid) {
        const error = new Error("You must be logged in to place an order");
        setError(error);
        feedback?.showError("You must be logged in to place an order");
        throw error;
      }
      
      // Create the order object
      const newOrder = {
        userId: currentUser.uid,
        items: [...cart],
        itemCount: getCartCount(),
        subtotal: getSubtotal(),
        tax: getSubtotal() * 0.1, // 10% tax
        shipping: 5.00, // Fixed shipping cost
        total: getSubtotal() + (getSubtotal() * 0.1) + 5.00,
        status: 'pending',
        customer: orderData.customer,
        paymentMethod: orderData.paymentMethod,
        createdAt: serverTimestamp(),
      };
      
      // Add order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), newOrder);
      
      // Add the order ID to the order object
      const orderWithId = {
        ...newOrder,
        id: orderRef.id
      };
      
      // Add to local orders state
      setOrders(prevOrders => [orderWithId, ...prevOrders]);
      
      // Clear the cart after successful order
      clearCart();
      
      // Show success feedback
      feedback?.showSuccess("Order placed successfully!", 5000);
      
      return orderWithId;
      
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error);
      feedback?.showError(`Error placing order: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // The context value that will be provided to consuming components
  const contextValue = {
    cart,
    orders,
    loading,
    error,
    setError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getCartCount,
    placeOrder,
    loadOrders
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
}

// Custom hook to use the orders context
export function useOrders() {
  return useContext(OrdersContext);
}

export default OrdersContext;
