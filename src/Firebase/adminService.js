import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

// Collection reference
const USERS_COLLECTION = 'users';

/**
 * Check if a user has admin privileges
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export const isUserAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.roles && userData.roles.includes('admin');
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
};

/**
 * Get all users with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.role - Filter by role (optional)
 * @param {number} options.limit - Number of users to fetch (default: 20)
 * @param {Object} options.lastDoc - Last document for pagination (optional)
 * @returns {Promise<Object>} Object containing users array and last document for pagination
 */
export const getUsers = async (options = {}) => {
  try {
    const {
      role,
      limit: queryLimit = 20,
      lastDoc,
      searchTerm
    } = options;
    
    // Start building query
    let usersQuery = collection(db, USERS_COLLECTION);
    const constraints = [];
    
    // Add role filter if provided
    if (role && role !== 'all') {
      constraints.push(where('roles', 'array-contains', role));
    }
    
    // Add ordering
    constraints.push(orderBy('displayName', 'asc'));
    
    // Add pagination if last document provided
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    // Add limit
    constraints.push(limit(queryLimit));
    
    // Execute query
    const q = query(usersQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    // Extract users
    let users = [];
    querySnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter by search term if provided (client-side filtering)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      users = users.filter(user => 
        (user.displayName?.toLowerCase().includes(searchLower)) || 
        (user.email?.toLowerCase().includes(searchLower))
      );
    }
    
    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      users,
      lastDoc: lastVisible
    };
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

/**
 * Update a user's roles
 * @param {string} userId - The user ID
 * @param {Array<string>} roles - The new roles array
 * @returns {Promise<Object>} The updated user
 */
export const updateUserRoles = async (userId, roles) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(userRef, {
      roles
    });
    
    // Get updated user
    const updatedDoc = await getDoc(userRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
export const getUserStats = async () => {
  try {
    // Get total users count
    const usersRef = collection(db, USERS_COLLECTION);
    const totalSnapshot = await getCountFromServer(usersRef);
    const totalUsers = totalSnapshot.data().count;
    
    // Get admin users count
    const adminUsersRef = query(
      collection(db, USERS_COLLECTION),
      where('roles', 'array-contains', 'admin')
    );
    const adminSnapshot = await getCountFromServer(adminUsersRef);
    const adminUsers = adminSnapshot.data().count;
    
    return {
      totalUsers,
      adminUsers
    };
  } catch (error) {
    console.error("Error getting user statistics:", error);
    throw error;
  }
};
