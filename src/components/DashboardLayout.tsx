// src/components/DashboardLayout.tsx

import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

export default function DashboardLayout() {
  const { logout, role, username } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav bar */}
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="text-xl font-semibold">
          Promo Admin Portal
        </div>

        <nav className="space-x-6">
          <Link to="/draws" className="hover:underline">
            Draws
          </Link>
          <Link to="/upload-csv" className="hover:underline">
            Upload CSV
          </Link>
          <Link to="/prizes" className="hover:underline">
            Prize Structures
          </Link>
          <Link to="/winners" className="hover:underline">
            Winners
          </Link>
          <Link to="/users" className="hover:underline">
            Users
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {username} ({role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow bg-gray-100 p-6">
        <Outlet />
      </main>

      {/* Optional footer */}
      <footer className="bg-gray-200 text-center p-2 text-sm">
        &copy; 2025 Promo Portal
      </footer>
    </div>
  );
}
