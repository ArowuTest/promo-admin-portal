// src/components/DashboardLayout.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuthContext();

  return (
    <div>
      {/* Top navigation bar */}
      <nav
        style={{
          backgroundColor: '#333',
          color: '#fff',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <Link to="/draws" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}>
            Draws
          </Link>
          <Link to="/upload" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}>
            Upload CSV
          </Link>
          <Link to="/prizes" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}>
            Prize Structures
          </Link>
          <Link to="/winners" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}>
            Winners
          </Link>
          <Link to="/users" style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}>
            Users
          </Link>
        </div>
        <div>
          <span style={{ marginRight: '1rem' }}>
            {user?.username} ({user?.role})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* Main content area */}
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
