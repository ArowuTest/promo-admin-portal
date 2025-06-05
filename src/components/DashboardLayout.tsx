// src/components/DashboardLayout.tsx

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuthContext } from '@contexts/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <nav className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
        <div className="space-x-4">
          <Link to="/draws" className="hover:underline">
            Draws
          </Link>
          <Link to="/upload" className="hover:underline">
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
        </div>
        <div className="flex items-center space-x-4">
          <span>
            {user?.username} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}
