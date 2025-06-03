import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import LoginPage from '@pages/LoginPage';
import PrizeStructurePage from '@pages/PrizeStructurePage';
import DrawManagementPage from '@pages/DrawManagementPage';
import WinnersPage from '@pages/WinnersPage';
import UserManagementPage from '@pages/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* All routes below require authentication */}
        <Route
          path="/"
          element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SENIORUSER', 'WINNERREPORTS', 'ALLREPORTS']} />}
        >
          <Route path="" element={<Navigate to="/draws" />} />
          <Route path="draws" element={<DrawManagementPage />} />
          <Route path="prizes" element={<PrizeStructurePage />} />
          <Route path="winners" element={<WinnersPage />} />
        </Route>

        {/* User Management – only SUPERADMIN */}
        <Route
          path="/users/*"
          element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}
        >
          <Route path="" element={<UserManagementPage />} />
        </Route>

        {/* Fallback: redirect unknown to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
 
