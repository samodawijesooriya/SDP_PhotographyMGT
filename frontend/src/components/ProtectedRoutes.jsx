import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Protected route component for authenticated users
export const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

// Protected route for photographer role
export const PhotographerRoute = ({ redirectPath = '/' }) => {
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has photographer role
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      if (user.role === 'photographer') {
        setIsPhotographer(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not photographer, redirect to home
  if (!isPhotographer) {
    return <Navigate to={redirectPath} replace />;
  }

  // If photographer, render the child routes
  return <Outlet />;
};

// Protected route for admin role
export const AdminRoute = ({ redirectPath = '/' }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      if (user.role === 'admin') {
        setIsAdmin(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to={redirectPath} replace />;
  }

  // If admin, render the child routes
  return <Outlet />;
};