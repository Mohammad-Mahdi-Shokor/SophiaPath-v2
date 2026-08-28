import React from 'react';
import { useAuth } from '../context/AuthContext';

export const AllowedFor = ({ roles, children }) => {
  const { hasRole } = useAuth();

  // If the user role matches, show the content. Otherwise, show nothing.
  if (hasRole(roles)) {
    return <>{children}</>;
  }
  return null;
};
