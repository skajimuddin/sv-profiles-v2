// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import getAuth to initialize auth
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // Import getFunctions

// const firebaseConfig = {
//   apiKey: "AIzaSyAM2nmZqtgzWsBauSeszVxIZEbcQkfciHY",
//   authDomain: "astu-goa.firebaseapp.com",
//   projectId: "astu-goa",
//   storageBucket: "astu-goa.firebasestorage.app",
//   messagingSenderId: "744078397493",
//   appId: "1:744078397493:web:fe1ab265265e5bbac7617c",
//   measurementId: "G-E5T2N1B373"
// };

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBts29TvBew-M9gIikvsRpOzZkKtZRtpXs",
  authDomain: "test-app-c4c59.firebaseapp.com",
  projectId: "test-app-c4c59",
  storageBucket: "test-app-c4c59.firebasestorage.app",
  messagingSenderId: "677751152292",
  appId: "1:677751152292:web:41aa1208ad2f28edf6d031",
  measurementId: "G-1X5FWHSXEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const analytics = getAnalytics(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);
export const functions = getFunctions(app); // Initialize and export functions

