import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEditor from './pages/ArticleEditor';
import Subscribers from './pages/Subscribers';
import Messages from './pages/Messages';
import HomeContent from './pages/HomeContent';
import './styles/Admin.css';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index                element={<Dashboard />} />
          <Route path="articles"      element={<Articles />} />
          <Route path="articles/new"  element={<ArticleEditor />} />
          <Route path="articles/:id"  element={<ArticleEditor />} />
          <Route path="subscribers"   element={<Subscribers />} />
          <Route path="messages"      element={<Messages />} />
          <Route path="home"          element={<HomeContent />} />
          <Route path="*"             element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
