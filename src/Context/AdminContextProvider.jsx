import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContextProvider';
import { functions } from '../Firebase/firebase';
import { httpsCallable } from 'firebase/functions';

const AdminContext = createContext();

export const AdminContextProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const checkAdminStatus = useCallback(async () => {
    if (!currentUser) return false;
    
    try {
      const isUserAdmin = httpsCallable(functions, 'isUserAdmin');
      const { data } = await isUserAdmin();
      return data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [currentUser]);

  const createProduct = useCallback(async (productData) => {
    const createProductFn = httpsCallable(functions, 'createProduct');
    return createProductFn(productData);
  }, []);

  const updateProduct = useCallback(async (id, updateData) => {
    const updateProductFn = httpsCallable(functions, 'updateProduct');
    return updateProductFn({ id, ...updateData });
  }, []);

  const deleteProduct = useCallback(async (id) => {
    const deleteProductFn = httpsCallable(functions, 'deleteProduct');
    return deleteProductFn({ id });
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const updateOrderStatusFn = httpsCallable(functions, 'updateOrderStatus');
    return updateOrderStatusFn({ orderId, status });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        checkAdminStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminContextProvider');
  }
  return context;
};
