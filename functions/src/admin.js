const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { verifyAdmin } = require('./auth');

// Middleware to check admin status
const requireAdmin = async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to perform this action.'
    );
  }

  const isAdmin = await verifyAdmin(context.auth.uid);
  if (!isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You must be an admin to perform this action.'
    );
  }
};

// Create product (admin only)
exports.createProduct = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  try {
    const productData = {
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid
    };

    const docRef = await admin.firestore()
      .collection('products')
      .add(productData);

    return { id: docRef.id };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update product (admin only)
exports.updateProduct = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  try {
    const { id, ...updateData } = data;
    
    await admin.firestore()
      .collection('products')
      .doc(id)
      .update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid
      });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Delete product (admin only)
exports.deleteProduct = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  try {
    await admin.firestore()
      .collection('products')
      .doc(data.id)
      .delete();

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update order status (admin only)
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);

  try {
    const { orderId, status } = data;

    await admin.firestore()
      .collection('orders')
      .doc(orderId)
      .update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid
      });

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
