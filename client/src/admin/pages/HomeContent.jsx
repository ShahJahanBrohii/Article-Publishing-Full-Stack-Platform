import React, { useEffect, useState } from 'react';
import { getHomeContent, updateHomeContent } from '../adminApi';

function ArrayEditor({ label, items, onChange, fields }) {
  const add = () => {
    const blank = Object.fromEntries(fields.map((f) => [f.key, '']));
    onChange([...items, blank]);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));

  return (
    <div className="admin-array-editor">
      <div className="admin-array-editor__head">
        <h3 className="admin-card__title">{label}</h3>
        <button type="button" className="admin-btn admin-btn--xs" onClick={add}>
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="admin-array-item">
          <div className="admin-array-item__fields">
            {fields.map((f) => (
              <div key={f.key} className="admin-field admin-field--sm">
                <label className="admin-label">{f.label}</label>
                <input
                  className="admin-input"
                  value={item[f.key] || ''}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder || ''}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--xs admin-btn--danger"
            onClick={() => remove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="admin-array-editor__empty">No items — click + Add.</p>
      )}
    </div>
  );
}

const SIDEBAR_FIELDS = [
  { key: 'category', label: 'Category', placeholder: 'Markets' },
  { key: 'headline', label: 'Headline', placeholder: 'Article headline' },
  { key: 'time',     label: 'Time',     placeholder: '2 hrs ago' },
  { key: 'to',       label: 'Link',     placeholder: '/investing/stocks-bonds' },
];

const OPINION_FIELDS = [
  { key: 'headline', label: 'Headline' },
  { key: 'excerpt',  label: 'Excerpt' },
  { key: 'author',   label: 'Author' },
  { key: 'bio',      label: 'Bio' },
  { key: 'to',       label: 'Link' },
];

const MOST_READ_FIELDS = [
  { key: 'headline', label: 'Headline' },
  { key: 'views',    label: 'Views', placeholder: '142K' },
  { key: 'to',       label: 'Link', placeholder: '/article/1' },
];

export default function HomeContent() {
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    getHomeContent()
      .then((d) => setForm(d))
      .catch(() => setError('Could not load home content.'))
      .finally(() => setLoading(false));
  }, []);

  const setHero = (key, val) =>
    setForm((f) => ({ ...f, hero: { ...f.hero, [key]: val } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateHomeContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page-loading">Loading…</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">Home Content</h1>
        <button
          type="submit"
          form="home-form"
          className="admin-btn admin-btn--primary"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--err">{error}</div>}
      {saved && <div className="admin-alert admin-alert--ok">Home content updated.</div>}

      <form id="home-form" onSubmit={handleSave}>

        {/* Hero */}
        <div className="admin-card" style={{ marginBottom: '20px' }}>
          <h2 className="admin-card__title">Hero Section</h2>
          <div className="admin-two-col">
            {[
              { key: 'category',    label: 'Category Tag' },
              { key: 'author',      label: 'Author' },
              { key: 'date',        label: 'Date' },
              { key: 'readTime',    label: 'Read Time' },
            ].map(({ key, label }) => (
              <div key={key} className="admin-field">
                <label className="admin-label">{label}</label>
                <input
                  className="admin-input"
                  value={form.hero?.[key] || ''}
                  onChange={(e) => setHero(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="admin-field">
            <label className="admin-label">Headline</label>
            <input
              className="admin-input"
              value={form.hero?.headline || ''}
              onChange={(e) => setHero('headline', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Subheadline</label>
            <textarea
              className="admin-input admin-textarea"
              rows={2}
              value={form.hero?.subheadline || ''}
              onChange={(e) => setHero('subheadline', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Body (paragraphs)</label>
            <textarea
              className="admin-input admin-textarea admin-textarea--tall"
              rows={6}
              value={form.hero?.body || ''}
              onChange={(e) => setHero('body', e.target.value)}
            />
          </div>
          <div className="admin-two-col">
            <div className="admin-field">
              <label className="admin-label">Image URL</label>
              <input
                className="admin-input"
                value={form.hero?.image || ''}
                onChange={(e) => setHero('image', e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Image Caption</label>
              <input
                className="admin-input"
                value={form.hero?.caption || ''}
                onChange={(e) => setHero('caption', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar News */}
        <div className="admin-card" style={{ marginBottom: '20px' }}>
          <p className="admin-field__hint" style={{ marginBottom: '12px' }}>
            Optional pinned items. If you leave this short or empty, the home page auto-fills from latest published articles.
          </p>
          <ArrayEditor
            label="Latest / Sidebar News (Pinned)"
            items={form.sidebarNews || []}
            onChange={(val) => setForm((f) => ({ ...f, sidebarNews: val }))}
            fields={SIDEBAR_FIELDS}
          />
        </div>

        {/* Opinion */}
        <div className="admin-card" style={{ marginBottom: '20px' }}>
          <p className="admin-field__hint" style={{ marginBottom: '12px' }}>
            Optional pinned opinion items. If empty, Opinion auto-pulls from published articles.
          </p>
          <ArrayEditor
            label="Opinion Pieces (Pinned)"
            items={form.opinionPieces || []}
            onChange={(val) => setForm((f) => ({ ...f, opinionPieces: val }))}
            fields={OPINION_FIELDS}
          />
        </div>

        {/* Most Read */}
        <div className="admin-card" style={{ marginBottom: '20px' }}>
          <ArrayEditor
            label="Most Read"
            items={form.mostRead || []}
            onChange={(val) => setForm((f) => ({ ...f, mostRead: val }))}
            fields={MOST_READ_FIELDS}
          />
        </div>

      </form>
    </div>
  );
}
