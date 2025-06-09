import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    // Not logged in, redirect to login page, but save the location they were trying to go to.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles are specified, check if the user's role is included.
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User is logged in but does not have the required role.
    // Redirect to a safe default page (the main dashboard).
    return <Navigate to="/" replace />;
  }

  // If the component has children passed to it (e.g., <ProtectedRoute><Page/></ProtectedRoute>), render them.
  // Otherwise, if it's used as a layout route (e.g., <Route element={<ProtectedRoute/>}>), render the Outlet.
  // This makes the component flexible for both uses in App.tsx.
  return children ? <>{children}</> : <Outlet />;
}