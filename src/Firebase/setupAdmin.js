import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Grants admin role to a user based on their email
 * @param {string} email - The email of the user to promote
 * @returns {Promise<Object>} Status of the operation
 */
export const promoteToAdmin = async (email) => {
  try {
    // Find user by email
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return { success: false, error: `No user found with email ${email}` };
    }
    
    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if user is already an admin
    if (userData.roles && userData.roles.includes('admin')) {
      return { success: false, error: `User ${email} is already an admin` };
    }
    
    // Add admin role
    const roles = userData.roles || ['user'];
    if (!roles.includes('admin')) {
      roles.push('admin');
    }
    
    // Update user document
    await updateDoc(doc(db, 'users', userDoc.id), { roles });
    
    return { 
      success: true, 
      message: `Successfully promoted ${email} to admin`
    };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a given email belongs to an admin user
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export const isAdminEmail = async (email) => {
  try {
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    return userData.roles && userData.roles.includes('admin');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
