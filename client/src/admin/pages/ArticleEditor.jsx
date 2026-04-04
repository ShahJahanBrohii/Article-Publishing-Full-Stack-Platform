import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { getArticle, createArticle, updateArticle, togglePublish } from '../adminApi';
import '../styles/ArticleEditor.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTIONS = ['investing', 'personal-finance', 'financial-education', 'guides'];

const EMPTY = {
  title:           '',
  topic:           '',
  excerpt:         '',
  body:            '',
  image:           '',
  author:          'Junaid Ahmed',
  status:          'draft',
  section:         '',
  tags:            '',
  metaTitle:       '',
  metaDescription: '',
};

const API_BASE = () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const getToken = () => sessionStorage.getItem('admin_token') || '';

// ─── Toolbar button ────────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`rte-btn ${active ? 'rte-btn--active' : ''}`}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={!!active}
    >
      {children}
    </button>
  );
}

// ─── Rich text toolbar ─────────────────────────────────────────────────────────
function EditorToolbar({ editor, onImageUploadClick }) {
  if (!editor) return null;

  const addLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url  = window.prompt('Enter URL', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link')
      .setLink({ href: url, target: '_blank' }).run();
  };

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">

      {/* Text style */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough">
          <s>S</s>
        </ToolbarBtn>
      </div>

      <div className="rte-toolbar__sep" />

      {/* Headings */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          H2
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          H3
        </ToolbarBtn>
      </div>

      <div className="rte-toolbar__sep" />

      {/* Lists */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet list">
          ≡
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered list">
          1≡
        </ToolbarBtn>
      </div>

      <div className="rte-toolbar__sep" />

      {/* Blocks */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Blockquote">
          ❝
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule">
          —
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')} title="Code block">
          {'</>'}
        </ToolbarBtn>
      </div>

      <div className="rte-toolbar__sep" />

      {/* Link + Image */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={addLink}
          active={editor.isActive('link')} title="Insert / edit link">
          🔗
        </ToolbarBtn>
        <ToolbarBtn onClick={onImageUploadClick} title="Insert image">
          🖼
        </ToolbarBtn>
      </div>

      <div className="rte-toolbar__sep" />

      {/* Undo / Redo */}
      <div className="rte-toolbar__group">
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          ↩
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          ↪
        </ToolbarBtn>
      </div>

      {/* Word count */}
      <span className="rte-toolbar__wordcount">{wordCount} words</span>
    </div>
  );
}

// ─── Image insert panel (inline, above editor) ────────────────────────────────
function ImageUploadPanel({ onInsert, onClose }) {
  const [tab,       setTab]       = useState('upload');
  const [urlValue,  setUrlValue]  = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [preview,   setPreview]   = useState('');
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file?.type.startsWith('image/')) {
      setUploadErr('Please select an image file.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Image must be under 5 MB.'); return;
    }
    setUploadErr('');
    setUploading(true);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE()}/api/upload/image`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      onInsert(url);
    } catch (err) {
      setUploadErr(err.message);
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="img-panel">
      <div className="img-panel__header">
        <span className="img-panel__title">Insert image</span>
        <button type="button" className="img-panel__close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="img-panel__tabs">
        <button type="button"
          className={`img-panel__tab ${tab === 'upload' ? 'img-panel__tab--active' : ''}`}
          onClick={() => setTab('upload')}>Upload file</button>
        <button type="button"
          className={`img-panel__tab ${tab === 'url' ? 'img-panel__tab--active' : ''}`}
          onClick={() => setTab('url')}>From URL</button>
      </div>

      {tab === 'upload' && (
        <div className="img-panel__body">
          <div
            className={`img-dropzone ${uploading ? 'img-dropzone--loading' : ''}`}
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload image by clicking or dragging"
          >
            {uploading ? (
              <span className="img-dropzone__text">Uploading…</span>
            ) : preview ? (
              <img src={preview} alt="preview" className="img-dropzone__preview" />
            ) : (
              <>
                <span className="img-dropzone__icon">🖼</span>
                <span className="img-dropzone__text">Click or drag an image here</span>
                <span className="img-dropzone__sub">PNG, JPG, GIF, WebP — max 5 MB</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => uploadFile(e.target.files?.[0])} />
          {uploadErr && <p className="img-panel__err">{uploadErr}</p>}
        </div>
      )}

      {tab === 'url' && (
        <div className="img-panel__body">
          <div className="admin-field">
            <label className="admin-label">Image URL</label>
            <input type="url" className="admin-input"
              placeholder="https://example.com/image.jpg"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              autoFocus />
          </div>
          {urlValue && (
            <img src={urlValue} alt="preview" className="img-panel__url-preview"
              onError={(e)  => { e.target.style.display = 'none'; }}
              onLoad={(e)   => { e.target.style.display = 'block'; }} />
          )}
          <button type="button" className="admin-btn admin-btn--primary"
            onClick={() => urlValue.trim() && onInsert(urlValue.trim())}
            disabled={!urlValue.trim()}>
            Insert
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Featured image uploader (sidebar card) ────────────────────────────────────
function FeaturedImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err,       setErr]       = useState('');
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) { setErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)     { setErr('Image must be under 5 MB.');     return; }
    setErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE()}/api/upload/image`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Upload failed (${res.status})`);
      }
      const { url } = await res.json();
      onChange(url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-field">
      <div className="feat-img-row">
        <button type="button" className="admin-btn admin-btn--sm"
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : '↑ Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])} />
        <span className="feat-img-or">or</span>
        <input type="url" className="admin-input feat-img-url"
          placeholder="paste URL…"
          value={value}
          onChange={(e) => onChange(e.target.value)} />
      </div>
      {err && <p className="img-panel__err">{err}</p>}
      {value && (
        <div className="feat-img-preview-wrap">
          <img src={value} alt="Featured" className="admin-img-preview" />
          <button type="button" className="feat-img-remove"
            onClick={() => onChange('')} aria-label="Remove image">
            × Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ArticleEditor ────────────────────────────────────────────────────────
export default function ArticleEditor() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form,             setForm]             = useState(EMPTY);
  const [loading,          setLoading]          = useState(isEdit);
  const [saving,           setSaving]           = useState(false);
  const [error,            setError]            = useState('');
  const [saved,            setSaved]            = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [showImgPanel,     setShowImgPanel]     = useState(false);

  // ── TipTap instance ──────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Write your article here…' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setForm((f) => ({ ...f, body: editor.getHTML() }));
    },
  });

  // ── Load article on edit ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !editor) return;
    getArticle(id)
      .then((a) => {
        setForm({ ...EMPTY, ...a, tags: Array.isArray(a.tags) ? a.tags.join(', ') : '' });
        editor.commands.setContent(a.body || '');
      })
      .catch(() => setError('Could not load article.'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, editor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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

  // ── Publish toggle with unpublish confirmation ────────────────────────────
  const handlePublishToggle = () => {
    if (form.status === 'published') { setConfirmUnpublish(true); return; }
    doToggle();
  };

  const doToggle = async () => {
    setConfirmUnpublish(false);
    try {
      await togglePublish(id);
      const updated = await getArticle(id);
      setForm((f) => ({ ...f, status: updated.status }));
    } catch {
      setError('Could not toggle publish status.');
    }
  };

  // ── Insert image into body ───────────────────────────────────────────────
  const handleInsertImage = useCallback((url) => {
    editor?.chain().focus().setImage({ src: url, alt: '' }).run();
    setShowImgPanel(false);
  }, [editor]);

  if (loading) return <div className="admin-page-loading">Loading article…</div>;

  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-page__head">
        <h1 className="admin-page__title">{isEdit ? 'Edit Article' : 'New Article'}</h1>
        <div className="admin-page__head-actions">
          {isEdit && (
            <button type="button"
              className={`admin-btn ${form.status === 'published' ? 'admin-btn--warning' : 'admin-btn--success'}`}
              onClick={handlePublishToggle}>
              {form.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          )}
          <button type="submit" form="article-form"
            className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Unpublish confirmation banner */}
      {confirmUnpublish && (
        <div className="admin-confirm-banner">
          <span>Unpublishing removes this article from the public site. Are you sure?</span>
          <div className="admin-confirm-banner__actions">
            <button type="button" className="admin-btn admin-btn--warning admin-btn--sm"
              onClick={doToggle}>Yes, unpublish</button>
            <button type="button" className="admin-btn admin-btn--sm"
              onClick={() => setConfirmUnpublish(false)}>Cancel</button>
          </div>
        </div>
      )}

      {error && <div className="admin-alert admin-alert--err">{error}</div>}
      {saved  && <div className="admin-alert admin-alert--ok">Saved successfully.</div>}

      <form id="article-form" onSubmit={handleSave} className="admin-editor-grid">

        {/* ── Left: main content ────────────────────────────────────────── */}
        <div className="admin-editor-main">
          <div className="admin-card">

            <div className="admin-field">
              <label className="admin-label">Title *</label>
              <input name="title" className="admin-input admin-input--title"
                value={form.title} onChange={handleChange}
                required placeholder="Article headline" />
            </div>

            <div className="admin-field">
              <label className="admin-label">Excerpt *</label>
              <textarea name="excerpt" className="admin-input admin-textarea" rows={3}
                value={form.excerpt} onChange={handleChange}
                required placeholder="Short summary shown on cards and feeds"
                maxLength={300} />
              <span className="admin-char-count">{form.excerpt.length} / 300</span>
            </div>

            {/* WYSIWYG editor */}
            <div className="admin-field">
              <label className="admin-label">Body</label>
              <div className="rte-wrap">
                <EditorToolbar
                  editor={editor}
                  onImageUploadClick={() => setShowImgPanel((v) => !v)}
                />
                {showImgPanel && (
                  <ImageUploadPanel
                    onInsert={handleInsertImage}
                    onClose={() => setShowImgPanel(false)}
                  />
                )}
                <EditorContent editor={editor} className="rte-content" />
              </div>
            </div>

          </div>
        </div>

        {/* ── Right: sidebar ────────────────────────────────────────────── */}
        <div className="admin-editor-sidebar">

          <div className="admin-card">
            <h3 className="admin-card__title">Details</h3>

            <div className="admin-field">
              <label className="admin-label">Topic *</label>
              <input name="topic" className="admin-input"
                value={form.topic} onChange={handleChange}
                required placeholder="e.g. Investing Basics" />
            </div>

            <div className="admin-field">
              <label className="admin-label">Section</label>
              <select name="section" className="admin-input admin-select"
                value={form.section} onChange={handleChange}>
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
              <input name="author" className="admin-input"
                value={form.author} onChange={handleChange} />
            </div>

            <div className="admin-field">
              <label className="admin-label">Tags</label>
              <input name="tags" className="admin-input"
                value={form.tags} onChange={handleChange}
                placeholder="comma, separated, tags" />
              <span className="admin-field__hint">Separate tags with commas</span>
            </div>

            <div className="admin-field">
              <label className="admin-label">Status</label>
              <span className={`admin-badge admin-badge--${form.status}`}>{form.status}</span>
            </div>
          </div>

          {/* Featured image */}
          <div className="admin-card">
            <h3 className="admin-card__title">Featured Image</h3>
            <FeaturedImageUploader
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            />
          </div>

          {/* SEO */}
          <div className="admin-card">
            <h3 className="admin-card__title">SEO</h3>
            <div className="admin-field">
              <label className="admin-label">Meta title</label>
              <input name="metaTitle" className="admin-input"
                value={form.metaTitle || ''} onChange={handleChange}
                placeholder="Defaults to article title" maxLength={70} />
              <span className="admin-char-count">{(form.metaTitle || '').length} / 70</span>
            </div>
            <div className="admin-field">
              <label className="admin-label">Meta description</label>
              <textarea name="metaDescription" className="admin-input admin-textarea" rows={3}
                value={form.metaDescription || ''} onChange={handleChange}
                placeholder="Defaults to excerpt" maxLength={160} />
              <span className="admin-char-count">{(form.metaDescription || '').length} / 160</span>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}