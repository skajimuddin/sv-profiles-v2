const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import and export all functions
const auth = require('./src/auth');
const payments = require('./src/payments');
const adminFunctions = require('./src/admin');

// Auth functions
exports.isUserAdmin = auth.isUserAdmin;

// Payment functions
exports.createRazorpayOrder = payments.createRazorpayOrder;
exports.verifyRazorpayPayment = payments.verifyRazorpayPayment;

// Admin functions
exports.createProduct = adminFunctions.createProduct;
exports.updateProduct = adminFunctions.updateProduct;
exports.deleteProduct = adminFunctions.deleteProduct;
exports.updateOrderStatus = adminFunctions.updateOrderStatus;

// Initialize Razorpay
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware to verify admin role
const verifyAdmin = async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData || !userData.roles || !userData.roles.includes('admin')) {
      throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
    }
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error verifying admin status');
  }
};

// Create Razorpay Order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const order = await razorpay.orders.create({
      amount: data.amount * 100, // Convert to paise
      currency: data.currency || 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    });

    return { orderId: order.id };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error creating Razorpay order');
  }
});

// Verify Razorpay Payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSign !== razorpay_signature) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid payment signature');
  }

  try {
    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment not captured');
    }

    // Update order status in Firestore
    await admin.firestore().collection('orders').doc(data.orderId).update({
      paymentStatus: 'completed',
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error verifying payment');
  }
});

// Admin Functions

// Get All Orders (Admin Only)
exports.getAllOrders = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  try {
    const ordersSnapshot = await admin.firestore().collection('orders').get();
    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching orders');
  }
});

// Update Order Status (Admin Only)
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  try {
    await admin.firestore().collection('orders').doc(data.orderId).update({
      status: data.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error updating order status');
  }
});

// Get All Users (Admin Only)
exports.getAllUsers = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  try {
    const usersSnapshot = await admin.firestore().collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        userType: userData.userType,
        status: userData.status,
        createdAt: userData.createdAt
      });
    });
    return users;
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching users');
  }
});

// Update User Status (Admin Only)
exports.updateUserStatus = functions.https.onCall(async (data, context) => {
  await verifyAdmin(context);

  try {
    await admin.firestore().collection('users').doc(data.userId).update({
      status: data.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error updating user status');
  }
});
