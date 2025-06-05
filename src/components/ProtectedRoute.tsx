// src/components/ProtectedRoute.tsx

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: string[];
}) {
  const { token, role } = useContext(AuthContext);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed, redirect to login (or show unauthorized)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role!)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
