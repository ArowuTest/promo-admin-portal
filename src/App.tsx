// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import DrawManagementPage from './pages/DrawManagementPage';
import CsvUploadPage from './pages/CsvUploadPage';
import PrizeStructurePage from './pages/PrizeStructurePage';
import WinnersPage from './pages/WinnersPage';
import UserManagementPage from './pages/UserManagementPage';

import DashboardLayout from './components/DashboardLayout';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthContext();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected / Dashboard routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* This is where DashboardLayout’s <Outlet/> will render: */}

            <Route index element={<Navigate to="draws" replace />} />

            <Route path="draws" element={<DrawManagementPage />} />
            <Route path="upload" element={<CsvUploadPage />} />
            <Route path="prizes" element={<PrizeStructurePage />} />
            <Route path="winners" element={<WinnersPage />} />
            <Route path="users" element={<UserManagementPage />} />

            {/* Any unknown child of “/” goes back to /draws */}
            <Route path="*" element={<Navigate to="draws" replace />} />
          </Route>

          {/* Catch any other unknown path → to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
