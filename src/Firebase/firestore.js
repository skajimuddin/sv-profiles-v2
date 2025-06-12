// firestore.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Note: Business profiles functionality has been removed for simplification

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return {
        id: userDocSnap.id,
        ...userDocSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user data
export const updateUser = async (userId, data) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Note: Business profile management functions have been removed for simplification