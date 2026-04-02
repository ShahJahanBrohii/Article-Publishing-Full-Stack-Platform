import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticle, createArticle, updateArticle, togglePublish } from '../adminApi';

const SECTIONS = ['investing', 'personal-finance', 'financial-education', 'guides'];

const EMPTY = {
  title:    '',
  topic:    '',
  excerpt:  '',
  body:     '',
  image:    '',
  author:   'Junaid Ahmed',
  status:   'draft',
  section:  '',
  tags:     '',
};

export default function ArticleEditor() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getArticle(id)
      .then((a) =>
        setForm({
          ...a,
          tags: Array.isArray(a.tags) ? a.tags.join(', ') : '',
        })
      )
      .catch(() => setError('Could not load article.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      if (isEdit) {
        await updateArticle(id, payload);
      } else {
        const created = await createArticle(payload);
        navigate(`/admin/articles/${created._id}`, { replace: true });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!id) return;
    await togglePublish(id);
    const updated = await getArticle(id);
    setForm((f) => ({ ...f, status: updated.status }));
  };

  if (loading) return <div className="admin-page-loading">Loading article…</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="admin-page__head-actions">
          {isEdit && (
            <button
              type="button"
              className={`admin-btn ${
                form.status === 'published' ? 'admin-btn--warning' : 'admin-btn--success'
              }`}
              onClick={handlePublishToggle}
            >
              {form.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          )}
          <button
            type="submit"
            form="article-form"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error  && <div className="admin-alert admin-alert--err">{error}</div>}
      {saved  && <div className="admin-alert admin-alert--ok">Saved successfully.</div>}

      <form id="article-form" onSubmit={handleSave} className="admin-editor-grid">

        {/* Left — main content */}
        <div className="admin-editor-main">
          <div className="admin-card">
            <div className="admin-field">
              <label className="admin-label">Title *</label>
              <input
                name="title"
                className="admin-input"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Article headline"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Excerpt *</label>
              <textarea
                name="excerpt"
                className="admin-input admin-textarea"
                rows={3}
                value={form.excerpt}
                onChange={handleChange}
                required
                placeholder="Short summary shown on cards and feeds"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Body</label>
              <textarea
                name="body"
                className="admin-input admin-textarea admin-textarea--tall"
                rows={16}
                value={form.body}
                onChange={handleChange}
                placeholder="Full article body — plain text or Markdown"
              />
            </div>
          </div>
        </div>

        {/* Right — meta */}
        <div className="admin-editor-sidebar">

          <div className="admin-card">
            <h3 className="admin-card__title">Details</h3>

            <div className="admin-field">
              <label className="admin-label">Topic *</label>
              <input
                name="topic"
                className="admin-input"
                value={form.topic}
                onChange={handleChange}
                required
                placeholder="e.g. Investing Basics"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Section</label>
              <select
                name="section"
                className="admin-input admin-select"
                value={form.section}
                onChange={handleChange}
              >
                <option value="">— None —</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label">Author</label>
              <input
                name="author"
                className="admin-input"
                value={form.author}
                onChange={handleChange}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Tags</label>
              <input
                name="tags"
                className="admin-input"
                value={form.tags}
                onChange={handleChange}
                placeholder="comma, separated, tags"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Status</label>
              <span className={`admin-badge admin-badge--${form.status}`}>
                {form.status}
              </span>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-card__title">Featured Image</h3>
            <div className="admin-field">
              <label className="admin-label">Image URL</label>
              <input
                name="image"
                className="admin-input"
                value={form.image}
                onChange={handleChange}
                placeholder="https://…"
              />
            </div>
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="admin-img-preview"
              />
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
