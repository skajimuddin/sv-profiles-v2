// adminTools.js
// These are utility functions that can be run by an administrator to help
// fix issues with user accounts and Firestore permissions.

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Initializes or repairs a user document in Firestore
export const initializeUserProfile = async (userId, userData = {}) => {
  if (!userId) {
    throw new Error("userId is required");
  }
  
  try {
    // Default user data structure
    const defaultUserData = {
      uid: userId,
      displayName: userData.displayName || "User",
      email: userData.email || "",
      userType: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Merge provided data with default data
    const mergedData = {
      ...defaultUserData,
      ...userData,
      uid: userId // Ensure userId is not overridden
    };
    
    // Create or update the user document
    await setDoc(doc(db, "users", userId), mergedData, { merge: true });
    
    console.log(`User profile initialized/repaired for ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error initializing user profile:", error);
    return { success: false, error: error.message };
  }
};

// Add any other admin utility functions below
