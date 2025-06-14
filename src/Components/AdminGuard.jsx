import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContextProvider';
import { useAdmin } from '../Context/AdminContextProvider';
import LoadingSpinner from './LoadingSpinner';

const AdminGuard = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { checkAdminStatus } = useAdmin();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [currentUser, checkAdminStatus]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Verifying admin access..." />;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
