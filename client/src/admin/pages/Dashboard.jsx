import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../adminApi';
import { getSubscribers } from '../adminApi';
import { getMessages } from '../adminApi';

function StatCard({ label, value, sub, to, color }) {
  return (
    <Link to={to} className={`admin-stat-card admin-stat-card--${color}`}>
      <div className="admin-stat-card__value">{value ?? '—'}</div>
      <div className="admin-stat-card__label">{label}</div>
      {sub && <div className="admin-stat-card__sub">{sub}</div>}
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [artData, subData, msgData, draftData] = await Promise.all([
          getArticles('status=published&limit=1'),
          getSubscribers('limit=1'),
          getMessages('limit=1'),
          getArticles('status=draft&limit=1'),
        ]);
        const [recentArt] = await Promise.all([
          getArticles('limit=5'),
        ]);
        setStats({
          published: artData.total,
          drafts:    draftData.total,
          subscribers: subData.total,
          unread:    msgData.total,
        });
        setRecent(recentArt.articles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="admin-page-loading">Loading dashboard…</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">Dashboard</h1>
        <div className="admin-page__head-actions">
          <Link to="/admin/articles/new" className="admin-btn admin-btn--primary">
            + New Article
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid">
        <StatCard
          label="Published Articles"
          value={stats?.published}
          to="/admin/articles?status=published"
          color="blue"
        />
        <StatCard
          label="Drafts"
          value={stats?.drafts}
          to="/admin/articles?status=draft"
          color="amber"
        />
        <StatCard
          label="Subscribers"
          value={stats?.subscribers}
          to="/admin/subscribers"
          color="green"
        />
        <StatCard
          label="Messages"
          value={stats?.unread}
          sub="in inbox"
          to="/admin/messages"
          color="red"
        />
      </div>

      {/* Recent Articles */}
      <div className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-card__title">Recent Articles</h2>
          <Link to="/admin/articles" className="admin-link">View all →</Link>
        </div>
        <table className="admin-table admin-table--recent">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  No articles yet —{' '}
                  <Link to="/admin/articles/new">create your first one</Link>
                </td>
              </tr>
            )}
            {recent.map((a) => (
              <tr key={a._id}>
                <td className="admin-table__primary">{a.title}</td>
                <td>{a.topic}</td>
                <td>
                  <span className={`admin-badge admin-badge--${a.status}`}>
                    {a.status}
                  </span>
                </td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/articles/${a._id}`} className="admin-link">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
