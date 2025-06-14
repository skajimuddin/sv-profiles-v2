const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create an order.'
    );
  }

  try {
    const { amount, currency = 'INR', receipt } = data;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit (paise)
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error creating payment order.'
    );
  }
});

// Verify Razorpay payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to verify payment.'
    );
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = data;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Verify payment status
    if (payment.status !== 'captured') {
      throw new Error('Payment not captured');
    }

    // Create a record in Firestore
    const paymentDoc = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: payment.status,
      userId: context.auth.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore()
      .collection('payments')
      .doc(razorpay_payment_id)
      .set(paymentDoc);

    return { success: true, payment: paymentDoc };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error verifying payment: ' + error.message
    );
  }
});
