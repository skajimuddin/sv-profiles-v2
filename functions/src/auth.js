const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Verify if a user has admin role
exports.verifyAdmin = async (uid) => {
  try {
    const user = await admin.auth().getUser(uid);
    const customClaims = user.customClaims || {};
    return customClaims.admin === true;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};

// HTTP function to check admin status
exports.isUserAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to check admin status.'
    );
  }

  const isAdmin = await exports.verifyAdmin(context.auth.uid);
  return { isAdmin };
});
