// testFirestore.js
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Function to test if the current user has write access to Firestore
export const testFirestoreAccess = async (userId) => {
  if (!userId) {
    console.error("No userId provided for Firestore access test");
    return false;
  }
  
  try {
    // Try to write a test field to the user document
    const testData = {
      lastAccessTest: new Date().toISOString()
    };
    
    await setDoc(doc(db, "users", userId), testData, { merge: true });
    console.log("Firestore write access test: SUCCESS");
    return true;
  } catch (error) {
    console.error("Firestore write access test: FAILED", error);
    return false;
  }
};

// Function to test if the current user has read access to Firestore
export const testFirestoreReadAccess = async (userId) => {
  if (!userId) {
    console.error("No userId provided for Firestore read access test");
    return false;
  }
  
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    console.log("Firestore read access test: SUCCESS");
    return true;
  } catch (error) {
    console.error("Firestore read access test: FAILED", error);
    return false;
  }
};
