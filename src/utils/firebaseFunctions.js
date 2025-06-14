import { functions } from "../Firebase/firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Create a new Razorpay order through Firebase Functions
 */
export const createRazorpayOrder = async (orderData, amount) => {
  try {
    const createOrder = httpsCallable(functions, 'createRazorpayOrder');
    const { data } = await createOrder({
      amount,
      currency: import.meta.env.VITE_CURRENCY || "INR",
      receipt: orderData.orderId
    });

    return data.orderId;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment through Firebase Functions
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
    const { data } = await verifyPayment(paymentData);
    return data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};
