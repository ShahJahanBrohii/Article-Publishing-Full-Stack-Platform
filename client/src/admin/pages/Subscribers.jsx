import React, { useEffect, useState, useCallback } from 'react';
import { getSubscribers, deleteSubscriber, exportSubscribers } from '../adminApi';

export default function Subscribers() {
  const [data, setData]       = useState({ subscribers: [], total: 0 });
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 50 });
      if (search) q.set('search', search);
      const res = await getSubscribers(q.toString());
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Remove ${email} from subscribers?`)) return;
    await deleteSubscriber(id);
    load();
  };

  const handleExport = async () => {
    try {
      await exportSubscribers();
    } catch (err) {
      window.alert(err.message || 'Could not export subscribers.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">
          Subscribers
          <span className="admin-page__count">{data.total}</span>
        </h1>
        <div className="admin-page__head-actions">
          <button className="admin-btn admin-btn--primary" onClick={handleExport}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="search"
          className="admin-input admin-input--search"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-page-loading">Loading…</div>
        ) : (
          <table className="admin-table admin-table--subscribers">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Active</th>
                <th>Subscribed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-table__empty">
                    No subscribers yet.
                  </td>
                </tr>
              )}
              {data.subscribers.map((s) => (
                <tr key={s._id}>
                  <td className="admin-table__primary">{s.email}</td>
                  <td>{s.source}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${s.active ? 'published' : 'draft'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="admin-btn admin-btn--xs admin-btn--danger"
                      onClick={() => handleDelete(s._id, s.email)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data.pages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`admin-page-btn ${page === p ? 'admin-page-btn--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
