import React, { useEffect, useState, useCallback } from 'react';
import { getMessages, markRead, deleteMessage } from '../adminApi';

export default function Messages() {
  const [data, setData]         = useState({ messages: [], total: 0 });
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: 50 });
      if (filter === 'unread') q.set('read', 'false');
      if (filter === 'read')   q.set('read', 'true');
      const res = await getMessages(q.toString());
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      await markRead(msg._id);
      setData((d) => ({
        ...d,
        messages: d.messages.map((m) =>
          m._id === msg._id ? { ...m, read: true } : m
        ),
      }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await deleteMessage(id);
    if (selected?._id === id) setSelected(null);
    load();
  };

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">
          Messages
          <span className="admin-page__count">{data.total}</span>
        </h1>
      </div>

      <div className="admin-filters">
        <div className="admin-filter-tabs">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              className={`admin-filter-tab ${filter === f ? 'admin-filter-tab--active' : ''}`}
              onClick={() => { setFilter(f); setSelected(null); }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-inbox">

        {/* Message List */}
        <div className="admin-inbox__list">
          {loading && <div className="admin-page-loading">Loading…</div>}
          {!loading && data.messages.length === 0 && (
            <div className="admin-table__empty" style={{ padding: '24px' }}>
              No messages.
            </div>
          )}
          {data.messages.map((msg) => (
            <div
              key={msg._id}
              className={`admin-inbox__item ${selected?._id === msg._id ? 'admin-inbox__item--active' : ''} ${!msg.read ? 'admin-inbox__item--unread' : ''}`}
              onClick={() => handleSelect(msg)}
            >
              <div className="admin-inbox__item-head">
                <span className="admin-inbox__item-name">{msg.name}</span>
                <span className="admin-inbox__item-date">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="admin-inbox__item-subject">{msg.subject}</div>
              <div className="admin-inbox__item-preview">
                {msg.message.slice(0, 80)}…
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="admin-inbox__detail">
          {!selected ? (
            <div className="admin-inbox__placeholder">
              Select a message to read it
            </div>
          ) : (
            <div className="admin-inbox__content">
              <div className="admin-inbox__detail-head">
                <div>
                  <h2 className="admin-inbox__detail-subject">{selected.subject}</h2>
                  <div className="admin-inbox__detail-meta">
                    <span><strong>{selected.name}</strong></span>
                    <span className="admin-inbox__detail-sep">·</span>
                    <a href={`mailto:${selected.email}`} className="admin-link">
                      {selected.email}
                    </a>
                    <span className="admin-inbox__detail-sep">·</span>
                    <span>{new Date(selected.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  className="admin-btn admin-btn--xs admin-btn--danger"
                  onClick={() => handleDelete(selected._id)}
                >
                  Delete
                </button>
              </div>
              <div className="admin-inbox__detail-body">
                {selected.message}
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="admin-btn admin-btn--primary"
              >
                Reply via Email
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
