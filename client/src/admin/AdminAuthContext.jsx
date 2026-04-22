import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const trimTrailingSlashes = (value = '') => String(value).trim().replace(/\/+$/, '');
const API = trimTrailingSlashes(import.meta.env.VITE_API_URL || 'http://localhost:5000');
const apiUrl = (path) => `${API}${path.startsWith('/') ? path : `/${path}`}`;

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }

    fetch(apiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ user }) => setAdmin({ ...user, token }))
      .catch(() => sessionStorage.removeItem('admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res  = await fetch(apiUrl('/api/auth/login'), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    sessionStorage.setItem('admin_token', data.token);
    setAdmin({ ...data.user, token: data.token });
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}

export const API_URL = API;
