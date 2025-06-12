// firestoreErrorHandler.js
import { auth } from './firebase';

/**
 * Gets a user-friendly message for Firebase errors
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) return 'An unknown error occurred';
  
  // Error code mapping for common Firebase errors
  const errorMessages = {
    // Firestore errors
    'permission-denied': 'Access denied. Your user account does not have permission to perform this action.',
    'unavailable': 'The Firebase service is currently unavailable. Please try again later.',
    'resource-exhausted': 'The operation has been rejected because the system is overloaded.',
    'not-found': 'The requested document was not found in the database.',
    'already-exists': 'The document already exists and cannot be created again.',
    
    // Auth errors (additional ones)
    'auth/email-already-in-use': 'This email address is already in use by another account.',
    'auth/user-disabled': 'This user account has been disabled by an administrator.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/operation-not-allowed': 'This operation is not allowed. Contact the administrator.',
    'auth/weak-password': 'The password is too weak. Please use a stronger password.'
  };
  
  const errorCode = error.code;
  return errorMessages[errorCode] || error.message || 'An error occurred';
};

// Function to handle Firestore errors
export const handleFirestoreError = (error) => {
  console.error("Firestore error:", error);
  
  // Check for permission errors
  if (error.code === "permission-denied") {
    console.warn("Permission denied. You need to update your Firestore security rules.");
    
    // Optional: Display a notification to the user
    alert(
      "Database access denied. This is likely due to security rules. " +
      "Please make sure your Firebase security rules are properly configured."
    );
  }
  
  return error;
};

// Higher-order function to wrap Firestore operations with error handling
export const withErrorHandling = (operation) => async (...args) => {
  try {
    return await operation(...args);
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  }
};

/**
 * Creates a fallback user document with minimal required data
 * @param {string} userId - User ID
 * @param {string} email - User email (optional)
 * @param {string} displayName - User display name (optional)
 * @returns {Object} Basic user data object
 */
export const createFallbackUserData = (userId, email = '', displayName = 'User') => {
  return {
    uid: userId,
    email: email,
    displayName: displayName,
    userType: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    _isFallback: true // Flag to identify fallback data
  };
};
