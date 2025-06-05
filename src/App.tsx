import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import DashboardLayout from '@components/DashboardLayout';

// Pages (one file each under src/pages/)
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
        {/* 1) Public route for login */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2) All other routes require authentication */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SENIORUSER', 'WINNERREPORTS', 'ALLREPORTS']} />
          }
        >
          {/* 3) Once authenticated, wrap everything in DashboardLayout to show the top menu */}
          <Route element={<DashboardLayout />}>
            {/* Redirect “/” → “/draws” by default */}
            <Route path="/" element={<Navigate to="/draws" replace />} />

            {/* Individual pages under the dashboard menu */}
            <Route path="draws" element={<DrawManagementPage />} />
            <Route path="upload" element={<CsvUploadPage />} />
            <Route path="prizes" element={<PrizeStructurePage />} />
            <Route path="winners" element={<WinnersPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* 4) Catch‐all: redirect anything unknown to “/” (which then sends to /draws) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
