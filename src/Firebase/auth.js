// auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { handleFirestoreError, withErrorHandling } from "./firestoreErrorHandler";

// Simple user type system
const UserType = {
  User: "user",
};

export const registerWithEmailAndPassword = async (email, password, displayName) => {  try {
    // Step 1: Validate email using external API
    /*
    try {
      console.log("Validating email address:", email);

      // Call external API to validate email
      const response = await fetch(
        "https://checkemail-mdovaqo3ra-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              email: email,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Email validation error:", result);
        // Log in browser console if email is spam
        console.log(
          "%cEmail validation failed - SPAM DETECTED:",
          "color: red; font-weight: bold",
          email
        );
        return {
          user: null,
          error:
            (result.error && result.error.message) ||
            "Temporary or spam emails are not allowed. Please use a valid email address.",
        };
      }

      // Email passed validation - log in browser console with green color
      console.log(
        "%cEmail validation passed - VALID EMAIL:",
        "color: green; font-weight: bold",
        email
      );
    } catch (error) {
      console.error("Email validation error:", error);
      return {
        user: null,
        error: "Unable to validate email. Please try again later.",
      };
    }
    */

    // Step 2: Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
  console.log("User created in auth.js:", user.uid); const userData = {
      uid: user.uid,
      email: user.email || email, // Use user.email or fallback to input email
      displayName: displayName || "", // Changed from fullName to displayName
      userType: UserType.User,
      status: "active", // Default status for new users
      roles: ["user"], // Default role is 'user', admins will have ['user', 'admin']
      createdAt: new Date().toISOString(),
    };
    console.log("Data to write to Firestore:", userData);    // Step 3: Store additional user data in Firestore
    try {
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("Firestore write successful for user:", user.uid);
      return { user, error: null };
    } catch (firestoreError) {
      console.error("Firestore write error:", firestoreError);
      handleFirestoreError(firestoreError);
      
      // Even if the Firestore write fails, we return the user since authentication succeeded
      // This allows the user to at least log in, even if some features may be limited
      return { 
        user, 
        error: "Account created, but user profile setup failed. Some features may be limited." 
      };
    }
  } catch (error) {
    console.error("Registration error in auth.js:", error);
    return { user: null, error: error.message };
  }
};

// Email/Password Sign In
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    try {
      // Check if user is active
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.status === "deactive") {
          // If user is deactivated, sign out and return error
          await signOut(auth);
          return {
            user: null,
            error: "Your account has been deactivated. Please contact support.",
          };
        }
      }
    } catch (firestoreError) {
      // Handle Firestore permission errors
      console.error("Error accessing user data:", firestoreError);
      handleFirestoreError(firestoreError);
      
      // Even with a Firestore error, we can still proceed with login
      console.log("Proceeding with login despite Firestore error");
    }

    return { user: userCredential.user, error: null };
  } catch (error) {
    // Improve error messages for common auth errors
    let errorMessage = error.message;
    
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid login credentials. Please check your email and password.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const googleProvider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(
      auth,
      googleProvider
    );
    const user = userCredential.user;

    // Reference to the user's document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    console.log(userDocSnap);    // If the document doesn't exist, create it
    if (!userDocSnap.exists()) {      
      const userData = {
        uid: user.uid,
        displayName: user.displayName || "Anonymous", // Already using displayName correctly
        email: user.email || "", // Optional: include email
        createdAt: new Date().toISOString(), // Timestamp of creation
        userType: UserType.User, // Using consistent UserType object
        status: "active", // Default status for new users
      };
      console.log(userData);

      try {
        await setDoc(userDocRef, userData);
        console.log(`Created new user document for UID: ${user.uid}`);
      } catch (firestoreError) {
        console.error("Firestore write error during Google sign-in:", firestoreError);
        handleFirestoreError(firestoreError);
        // Continue with authentication even if Firestore write fails
      }
    } else {
      // Check if the user is deactivated
      const userData = userDocSnap.data();
      if (userData.status === "deactive") {
        // If user is deactivated, sign out and return error
        await signOut(auth);
        return {
          user: null,
          error: "Your account has been deactivated. Please contact support.",
        };
      }

      console.log(`User document already exists for UID: ${user.uid}`);
    }

    return { user, error: null };  } catch (error) {
    console.error("Google sign-in error:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = error.message;
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled. The Google sign-in popup was closed.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Google sign-in popup was blocked. Please allow popups for this site and try again.';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Password Reset
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Check Login Status
export const checkAuthStatus = (callback, errorCallback) => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      callback(user);
    },
    (error) => {
      console.error("Auth state error:", error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
  return unsubscribe;
}
