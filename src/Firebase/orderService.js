import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection reference
const ORDERS_COLLECTION = 'orders';

/**
 * Get all orders with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (optional)
 * @param {string} options.userId - Filter by user ID (optional)
 * @param {number} options.limit - Number of orders to fetch (default: 20)
 * @param {Object} options.lastDoc - Last document for pagination (optional)
 * @param {string} options.orderByField - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction, 'asc' or 'desc' (default: 'desc')
 * @param {Date} options.startDate - Filter by start date (optional)
 * @param {Date} options.endDate - Filter by end date (optional)
 * @returns {Promise<Object>} Object containing orders array and last document for pagination
 */
export const getOrders = async (options = {}) => {
  try {
    const {
      status,
      userId,
      limit: queryLimit = 20,
      lastDoc,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      startDate,
      endDate,
    } = options;
    
    // Start building query
    let ordersQuery = collection(db, ORDERS_COLLECTION);
    const constraints = [];
    
    // Add status filter if provided
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    
    // Add user ID filter if provided
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }
    
    // Add date range filters if provided
    if (startDate) {
      const startTimestamp = Timestamp.fromDate(startDate);
      constraints.push(where('createdAt', '>=', startTimestamp));
    }
    
    if (endDate) {
      // Add 1 day to include the end date
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      const endTimestamp = Timestamp.fromDate(endDatePlusOne);
      constraints.push(where('createdAt', '<', endTimestamp));
    }
    
    // Always add ordering - note: must match any where() clauses for compound queries
    constraints.push(orderBy(orderByField, orderDirection));
    
    // Add pagination if last document provided
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    // Add limit
    constraints.push(limit(queryLimit));
    
    // Execute query
    const q = query(ordersQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    // Extract orders
    const orders = [];
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      orders,
      lastDoc: lastVisible
    };
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

/**
 * Get an order by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} The order object or null if not found
 */
export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

/**
 * Update an order's status
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 * @param {Object} additionalData - Any additional data to update
 * @returns {Promise<Object>} The updated order
 */
export const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData
    };
    
    await updateDoc(orderRef, updateData);
    
    // Get updated order
    const updatedDoc = await getDoc(orderRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Add notes to an order
 * @param {string} orderId - The order ID
 * @param {string} note - The note to add
 * @returns {Promise<Object>} The updated order
 */
export const addOrderNote = async (orderId, note) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error(`Order ${orderId} does not exist`);
    }
    
    const orderData = orderSnap.data();
    const notes = orderData.notes || [];
    
    const newNote = {
      text: note,
      timestamp: serverTimestamp(),
      date: new Date().toISOString()
    };
    
    // Add new note to the notes array
    await updateDoc(orderRef, {
      notes: [...notes, newNote],
      updatedAt: serverTimestamp()
    });
    
    // Get updated order
    const updatedDoc = await getDoc(orderRef);
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error adding order note:", error);
    throw error;
  }
};

/**
 * Get order statistics
 * @returns {Promise<Object>} Order statistics
 */
export const getOrderStats = async () => {
  try {
    // Get total orders count
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const totalSnapshot = await getCountFromServer(ordersRef);
    const totalOrders = totalSnapshot.data().count;
    
    // Get pending orders count
    const pendingRef = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getCountFromServer(pendingRef);
    const pendingOrders = pendingSnapshot.data().count;
    
    // Get completed orders count
    const completedRef = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'completed')
    );
    const completedSnapshot = await getCountFromServer(completedRef);
    const completedOrders = completedSnapshot.data().count;
    
    // Get cancelled orders count
    const cancelledRef = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'cancelled')
    );
    const cancelledSnapshot = await getCountFromServer(cancelledRef);
    const cancelledOrders = cancelledSnapshot.data().count;
    
    // Get total revenue (sum of all completed orders)
    const completedOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'completed')
    );
    const completedOrdersSnapshot = await getDocs(completedOrdersQuery);
    let totalRevenue = 0;
    
    completedOrdersSnapshot.forEach(doc => {
      const orderData = doc.data();
      if (orderData.total) {
        totalRevenue += orderData.total;
      }
    });
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    };
  } catch (error) {
    console.error("Error getting order statistics:", error);
    throw error;
  }
};
