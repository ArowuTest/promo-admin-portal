import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import DashboardLayout from '@components/DashboardLayout';
import LoginPage from '@pages/LoginPage';
import HomePage from '@pages/HomePage';
import PrizeStructurePage from '@pages/PrizeStructurePage';
import DrawManagementPage from '@pages/DrawManagementPage';
import CsvUploadPage from '@pages/CsvUploadPage';
import WinnersPage from '@pages/WinnersPage';
import UserManagementPage from '@pages/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="" element={<HomePage />} />
            <Route path="draws" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}><DrawManagementPage /></ProtectedRoute>}/>
            <Route path="csv-upload" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}><CsvUploadPage /></ProtectedRoute>}/>
            <Route path="prizes" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}><PrizeStructurePage /></ProtectedRoute>}/>
            <Route path="winners" element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'SENIORUSER']}><WinnersPage /></ProtectedRoute>}/>
            <Route path="users" element={<ProtectedRoute allowedRoles={['SUPERADMIN']}><UserManagementPage /></ProtectedRoute>}/>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;