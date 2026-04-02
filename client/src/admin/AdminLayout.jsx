import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

const NAV = [
  { to: '/admin',             label: 'Dashboard',   icon: '▦' },
  { to: '/admin/articles',    label: 'Articles',     icon: '✎' },
  { to: '/admin/subscribers', label: 'Subscribers',  icon: '◉' },
  { to: '/admin/messages',    label: 'Messages',     icon: '✉' },
  { to: '/admin/home',        label: 'Home Content', icon: '⌂' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate          = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'admin-shell--collapsed' : ''}`}>

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__head">
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-icon">WSI</span>
            {!collapsed && <span className="admin-sidebar__logo-text">Admin</span>}
          </div>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`
              }
            >
              <span className="admin-nav-link__icon">{icon}</span>
              {!collapsed && <span className="admin-nav-link__label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__foot">
          {!collapsed && (
            <div className="admin-sidebar__user">
              <span className="admin-sidebar__user-email">{admin?.email}</span>
              <span className="admin-sidebar__user-role">Administrator</span>
            </div>
          )}
          <button className="admin-logout-btn" onClick={handleLogout} title="Log out">
            <span>⎋</span>
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        <Outlet />
      </div>

    </div>
  );
}
