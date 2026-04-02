import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <span>Checking session…</span>
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin/login" replace />;
}
