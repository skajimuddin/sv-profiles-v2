import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  startAfter,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage } from './uploadImage';

// Collection references
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Add a new product to Firestore
 * @param {Object} productData - The product data
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} The new product with ID
 */
export const addProduct = async (productData, imageFile) => {
  try {
    let imageUrl = '';
    
    // Upload image if provided
    if (imageFile) {
      const imagePath = `products/${Date.now()}_${imageFile.name}`;
      const uploadResult = await uploadImage(imageFile, imagePath);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload product image');
      }
      
      imageUrl = uploadResult.url;
    }
    
    // Prepare product data with image URL and timestamps
    const newProduct = {
      ...productData,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), newProduct);
    
    // Return the new product with ID
    return {
      id: docRef.id,
      ...newProduct
    };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

/**
 * Update an existing product in Firestore
 * @param {string} productId - The product ID
 * @param {Object} productData - The updated product data
 * @param {File} imageFile - The new image file (optional)
 * @returns {Promise<Object>} The updated product
 */
export const updateProduct = async (productId, productData, imageFile) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    let updateData = { ...productData, updatedAt: serverTimestamp() };
    
    // Upload new image if provided
    if (imageFile) {
      const imagePath = `products/${Date.now()}_${imageFile.name}`;
      const uploadResult = await uploadImage(imageFile, imagePath);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload product image');
      }
      
      updateData.imageUrl = uploadResult.url;
    }
    
    // Update Firestore document
    await updateDoc(productRef, updateData);
    
    // Get the updated document
    const updatedDoc = await getDoc(productRef);
    
    // Return updated product with ID
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Delete a product from Firestore
 * @param {string} productId - The product ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

/**
 * Get a product by ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object|null>} The product object or null if not found
 */
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

/**
 * Get all products with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category (optional)
 * @param {number} options.limit - Number of products to fetch (default: 20)
 * @param {Object} options.lastDoc - Last document for pagination (optional)
 * @param {string} options.orderByField - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction, 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Object containing products array and last document for pagination
 */
export const getProducts = async (options = {}) => {
  try {
    const {
      category,
      limit: queryLimit = 20,
      lastDoc,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      searchTerm
    } = options;
    
    // Start building query
    let productsQuery = collection(db, PRODUCTS_COLLECTION);
    const constraints = [];
    
    // Add category filter if provided
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    
    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));
    
    // Add pagination if last document provided
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    // Add limit
    constraints.push(limit(queryLimit));
    
    // Execute query
    const q = query(productsQuery, ...constraints);
    const querySnapshot = await getDocs(q);
    
    // Extract products
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter by search term if provided (client-side filtering)
    let filteredProducts = products;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      products: filteredProducts,
      lastDoc: lastVisible
    };
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

/**
 * Get product categories
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories = [];
    
    querySnapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return categories;
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
};

/**
 * Add a new category
 * @param {Object} categoryData - The category data
 * @returns {Promise<Object>} The new category with ID
 */
export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...categoryData
    };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

/**
 * Get product count
 * @returns {Promise<number>} Total number of products
 */
export const getProductCount = async () => {
  try {
    const coll = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting product count:", error);
    throw error;
  }
};
