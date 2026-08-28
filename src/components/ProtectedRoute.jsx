import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-primary)' }}>
        Loading page...
      </div>
    );
  }

  // If not logged in, send them to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but does not have the correct role, redirect to courses page
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/courses" replace />;
  }

  // User is allowed -> render the requested page
  return <Outlet />;
};
