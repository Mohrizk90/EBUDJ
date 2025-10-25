import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFinanceContext } from '../contexts/ContextContext';

const ProtectedRoute = ({ children, requireContext = true }) => {
  const { currentContext, loading } = useFinanceContext();
  const location = useLocation();

  // Show loading state while contexts are being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If context is required but none is selected, redirect to context selection
  if (requireContext && !currentContext) {
    return <Navigate to="/contexts" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
