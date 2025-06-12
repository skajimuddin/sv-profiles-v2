// Enhanced Firebase error handling functions
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Try to fix Firestore permissions by explicitly setting user data
export const repairUserData = async (userId, userData = {}) => {
  if (!userId) {
    console.error("No user ID provided for repair");
    return { success: false, error: "No user ID provided" };
  }
  
  try {
    // Create a repair entry to validate permissions
    const repairData = {
      uid: userId,
      email: userData.email || '',
      displayName: userData.displayName || 'User',
      userType: 'user',
      status: 'active',
      repairTimestamp: new Date().toISOString(),
      _repaired: true
    };
    
    // Attempt to write to Firestore with proper error handling
    await setDoc(doc(db, "users", userId), repairData, { merge: true });
    console.log("✅ User data successfully repaired in Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to repair user data:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error",
      code: error.code || "unknown"
    };
  }
};

// Function that can be run in the browser console to help diagnose Firestore issues
export const diagnoseFirestoreIssues = async (userId) => {
  console.log("🔍 Starting Firestore diagnostics...");
  
  if (!userId) {
    console.error("⚠️ No user ID provided. Make sure you're logged in.");
    return;
  }

  try {
    console.log(`📄 Attempting to read user document for ${userId}`);
    
    // Test read access
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("✅ READ SUCCESS: User document exists");
        console.log("📋 Document data:", docSnap.data());
      } else {
        console.log("⚠️ User document does not exist");
      }
    } catch (readError) {
      console.error("❌ READ FAILED:", readError.message);
      console.error("Error code:", readError.code);
    }
    
    // Test write access
    try {
      console.log(`✏️ Attempting to write test data for ${userId}`);
      await setDoc(doc(db, "users", userId), {
        _diagnosticTest: new Date().toISOString()
      }, { merge: true });
      console.log("✅ WRITE SUCCESS: Successfully updated user document");
    } catch (writeError) {
      console.error("❌ WRITE FAILED:", writeError.message);
      console.error("Error code:", writeError.code);
    }

    console.log("🔍 Diagnostics completed");
  } catch (error) {
    console.error("❌ Diagnostics failed:", error);
  }
};

// Function to help generate Firebase security rules based on your needs
export const suggestSecurityRules = () => {
  console.log(`
================ RECOMMENDED FIREBASE SECURITY RULES ================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

================ HOW TO APPLY THESE RULES ================
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to Firestore Database > Rules
4. Replace the existing rules with these recommended rules
5. Click "Publish"

For development/testing, you can use these more permissive rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

WARNING: Do not use the development rules in production!
  `);
};

// Export a helpful utility that can be used in the browser console
window.FirebaseDebugTools = {
  diagnose: diagnoseFirestoreIssues,
  repair: repairUserData,
  suggestRules: suggestSecurityRules
};
