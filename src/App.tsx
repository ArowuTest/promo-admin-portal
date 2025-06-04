// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import DashboardLayout from '@components/DashboardLayout';

import LoginPage from '@pages/LoginPage';
import DrawManagementPage from '@pages/DrawManagementPage';
import CsvUploadPage from '@pages/CsvUploadPage';
import PrizeStructurePage from '@pages/PrizeStructurePage';
import WinnersPage from '@pages/WinnersPage';
import UserManagementPage from '@pages/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route: /login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected area – wraps a DashboardLayout which has a nav bar. */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              allowedRoles={[
                'SUPERADMIN',
                'ADMIN',
                'SENIORUSER',
                'WINNERREPORTS',
                'ALLREPORTS',
              ]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect from “/” to “/draws” */}
          <Route index element={<Navigate to="draws" replace />} />

          {/* Draws page (pick date/prize, run draw) */}
          <Route path="draws" element={<DrawManagementPage />} />

          {/* Separate “Upload CSV” page */}
          <Route path="upload-csv" element={<CsvUploadPage />} />

          {/* Prize Structures page */}
          <Route path="prizes" element={<PrizeStructurePage />} />

          {/* Winners page */}
          <Route path="winners" element={<WinnersPage />} />
        </Route>

        {/* User management – only SUPERADMIN can access */}
        <Route
          path="/users/*"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserManagementPage />} />
        </Route>

        {/* Fallback: redirect unknown to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
