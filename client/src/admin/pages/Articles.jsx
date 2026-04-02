import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getArticles, deleteArticle, togglePublish } from '../adminApi';

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData]       = useState({ articles: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const status = searchParams.get('status') || '';
  const page   = Number(searchParams.get('page') || 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15 });
      if (status) q.set('status', status);
      if (search) q.set('search', search);
      const res = await getArticles(q.toString());
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteArticle(id);
    load();
  };

  const handleToggle = async (id) => {
    await togglePublish(id);
    load();
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">Articles</h1>
        <Link to="/admin/articles/new" className="admin-btn admin-btn--primary">
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="search"
          className="admin-input admin-input--search"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-filter-tabs">
          {['', 'published', 'draft'].map((s) => (
            <button
              key={s}
              className={`admin-filter-tab ${status === s ? 'admin-filter-tab--active' : ''}`}
              onClick={() => setFilter('status', s)}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-page-loading">Loading…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.articles.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-table__empty">
                    No articles found.
                  </td>
                </tr>
              )}
              {data.articles.map((a) => (
                <tr key={a._id}>
                  <td className="admin-table__primary">{a.title}</td>
                  <td>{a.topic}</td>
                  <td>{a.author}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${a.status}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.views.toLocaleString()}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="admin-table__actions">
                    <Link
                      to={`/admin/articles/${a._id}`}
                      className="admin-btn admin-btn--xs"
                    >
                      Edit
                    </Link>
                    <button
                      className={`admin-btn admin-btn--xs ${
                        a.status === 'published'
                          ? 'admin-btn--warning'
                          : 'admin-btn--success'
                      }`}
                      onClick={() => handleToggle(a._id)}
                    >
                      {a.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="admin-btn admin-btn--xs admin-btn--danger"
                      onClick={() => handleDelete(a._id, a.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data.pages > 1 && (
          <div className="admin-pagination">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`admin-page-btn ${page === p ? 'admin-page-btn--active' : ''}`}
                onClick={() => setFilter('page', p)}
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
