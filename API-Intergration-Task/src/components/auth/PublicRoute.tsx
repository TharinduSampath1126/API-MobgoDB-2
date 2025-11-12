import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../customUi/loading';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    // If user is already authenticated, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};