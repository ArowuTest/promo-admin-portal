// src/components/ProtectedRoute.tsx

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

type Props = {
  allowedRoles: string[];
};

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { token, role } = useContext(AuthContext);

  // If no token, not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user’s role isn’t one of allowedRoles, redirect to login (or you could show 403)
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
