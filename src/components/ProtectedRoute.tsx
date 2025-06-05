import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Replace "useAuthContext" with whatever hook your AuthContext file actually provides
  const { token, role } = useAuthContext();

  // If there's no token at all, force login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If role is not among allowedRoles, also redirect to login (or an unauthorized page)
  if (allowedRoles.length > 0 && !allowedRoles.includes(role!)) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render child routes
  return <Outlet />;
}
