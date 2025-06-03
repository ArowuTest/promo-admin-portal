import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

export default function Navbar() {
  const { token, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-semibold text-indigo-600">
          Promo Admin
        </Link>
        {token && (
          <>
            <Link to="/draws" className="text-gray-700 hover:text-indigo-600">
              Draws
            </Link>
            <Link to="/prizes" className="text-gray-700 hover:text-indigo-600">
              Prize Structure
            </Link>
            <Link to="/winners" className="text-gray-700 hover:text-indigo-600">
              Winners
            </Link>
            {role === 'SUPERADMIN' && (
              <Link to="/users" className="text-gray-700 hover:text-indigo-600">
                Users
              </Link>
            )}
          </>
        )}
      </div>
      {token && (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
 
