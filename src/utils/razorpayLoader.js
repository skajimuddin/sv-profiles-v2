/**
 * Razorpay Integration Utility
 * Provides functions for loading the Razorpay SDK, processing payments,
 * and verifying payment signatures.
 */

/**
 * Dynamically loads the Razorpay script to avoid issues with SSR and improve page load performance
 * @returns {Promise} A promise that resolves when Razorpay is loaded
 */
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay payment instance and opens the payment modal
 * @param {Object} options - Razorpay payment options including amount, currency, etc.
 * @returns {Promise} A promise that resolves with payment success or rejects with payment failure
 */
export const makeRazorpayPayment = (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await loadRazorpay();
      
      if (!res) {
        reject(new Error('Razorpay SDK failed to load. Check your internet connection.'));
        return;
      }
      
      // Set default theme color from env if not provided
      if (!options.theme || !options.theme.color) {
        options.theme = {
          ...options.theme,
          color: import.meta.env.VITE_RAZORPAY_THEME_COLOR || "#D4AF37"
        };
      }
      
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.success', function (response) {
        resolve(response);
      });
      
      rzp.on('payment.error', function (error) {
        reject(error);
      });
      
      // Start the payment process
      rzp.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      reject(new Error('Failed to initialize payment. Please try again later.'));
    }
  });
};

/**
 * Formats the amount for display in the UI
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: from env or INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = import.meta.env.VITE_CURRENCY || 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Prepares the order data for Razorpay
 * @param {Object} orderData - The order data including customer information and cart items
 * @param {number} totalAmount - The total order amount
 * @returns {Object} The prepared order data with Razorpay-specific fields
 */
export const prepareRazorpayOrder = (orderData, totalAmount) => {
  return {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(totalAmount * 100), // Convert to smallest currency unit (paise)
    currency: import.meta.env.VITE_CURRENCY || "INR",
    name: import.meta.env.VITE_APP_NAME || "SV Profiles",
    description: `Order payment - ${orderData.customer.firstName} ${orderData.customer.lastName}`,
    image: "/logo.svg", // Replace with your logo path
    prefill: {
      name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
      email: orderData.customer.email,
      contact: orderData.customer.phone || ""
    },
    notes: {
      address: orderData.customer.address,
      orderId: orderData.orderId || ""
    },
    theme: {
      color: import.meta.env.VITE_RAZORPAY_THEME_COLOR || "#D4AF37"
    }
  };
};
