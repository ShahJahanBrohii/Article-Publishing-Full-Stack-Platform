import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';

export default function LoginPage() {
  const { login }  = useAdminAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [pending, setPending] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await login(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">

        <div className="admin-login-card__head">
          <div className="admin-login-card__logo">WSI</div>
          <h1 className="admin-login-card__title">Admin Login</h1>
          <p className="admin-login-card__sub">The Wall Street Investor</p>
        </div>

        {error && (
          <div className="admin-alert admin-alert--err">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label className="admin-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="admin-input"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="email"
              disabled={pending}
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="admin-input"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={pending}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--full"
            disabled={pending}
          >
            {pending ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
