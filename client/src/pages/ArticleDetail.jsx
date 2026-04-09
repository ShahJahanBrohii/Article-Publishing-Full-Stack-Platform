import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchComments, postComment } from '../lib/api';
import '../styles/ArticleDetail.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

function formatCommentDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return ''; }
}

function normalizeComment(c) {
  if (!c) return null;
  return {
    id:        String(c.id ?? c._id ?? `c-${Math.random()}`),
    author:    c.author || 'Reader',
    body:      c.body || c.text || '',
    createdAt: c.createdAt || c.created_at || new Date().toISOString(),
  };
}

function toSlug(text = '') {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function sanitizeAndEnhanceHtml(raw = '') {
  if (!raw || typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';

  const doc = new DOMParser().parseFromString(raw, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed, form').forEach((el) => el.remove());

  doc.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || '');

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });

    const tag = el.tagName;
    if (tag === 'H2' || tag === 'H3') {
      const text = (el.textContent || '').trim();
      if (!el.id) el.id = toSlug(text);
      el.classList.add('article-heading');
      if (tag === 'H2') el.classList.add('article-heading--h2');
    }

    if (tag === 'IMG') {
      el.classList.add('article-inline-image');
      if (!el.getAttribute('alt')) el.setAttribute('alt', 'Article image');
      el.setAttribute('loading', 'lazy');
      el.setAttribute('decoding', 'async');
    }
  });

  return doc.body.innerHTML;
}

// ─── Meta tags helper (updates <head> for SEO + Open Graph) ───────────────────
function setMetaTags({ title, description, image, url }) {
  document.title = title ? `${title} | The Wall Street Investor` : 'The Wall Street Investor';

  const set = (sel, attr, val) => {
    let el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      const [, name] = sel.match(/\[(?:name|property)="([^"]+)"\]/) || [];
      if (sel.includes('property=')) el.setAttribute('property', name);
      else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, val || '');
  };

  set('meta[name="description"]',         'content', description);
  set('meta[property="og:title"]',         'content', title);
  set('meta[property="og:description"]',   'content', description);
  set('meta[property="og:url"]',           'content', url);
  set('meta[property="og:type"]',          'content', 'article');
  if (image) set('meta[property="og:image"]', 'content', image);
  set('meta[name="twitter:card"]',         'content', 'summary_large_image');
  set('meta[name="twitter:title"]',        'content', title);
  set('meta[name="twitter:description"]',  'content', description);
  if (image) set('meta[name="twitter:image"]', 'content', image);
}

function clearMetaTags() {
  document.title = 'The Wall Street Investor';
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = '100%', style = {} }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 4, marginBottom: 10,
      background: 'rgba(0,0,0,0.07)', ...style,
    }} />
  );
}

// ─── Render article body: supports ### headings + paragraphs ──────────────────
function ArticleBody({ body, contentRef }) {
  if (!body) return null;

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  const safeHtml = useMemo(() => (hasHtml ? sanitizeAndEnhanceHtml(body) : ''), [hasHtml, body]);

  if (hasHtml) {
    return (
      <div
        className="article-content"
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

  return (
    <div className="article-content" ref={contentRef}>
      {body.split('\n\n').map((block, idx) => {
        // Skip empty blocks
        if (!block.trim()) return null;

        // Match markdown headings: ## or ###
        const h3 = block.match(/^###\s+(.+)$/);
        const h2 = block.match(/^##\s+(.+)$/);
        
        if (h3) {
          const text = h3[1];
          const slug = toSlug(text);
          return <h3 key={idx} id={slug} className="article-heading">{text}</h3>;
        }
        
        if (h2) {
          const text = h2[1];
          const slug = toSlug(text);
          return <h2 key={idx} id={slug} className="article-heading article-heading--h2">{text}</h2>;
        }
        
        // If block contains HTML tags, strip them and parse as plain text
        let cleanBlock = block
          .replace(/<p[^>]*>|<\/p>/g, '')  // Remove <p> tags
          .replace(/<br\s*\/?>/g, '')  // Remove <br> tags
          .replace(/<strong>|<\/strong>/g, '**')  // Convert strong to **
          .replace(/<em>|<\/em>/g, '*')  // Convert em to *
          .replace(/<[^>]+>/g, '')  // Remove any other HTML tags
          .trim();
        
        if (!cleanBlock) return null;
        
        // Parse bold markdown: **text**
        const parts = cleanBlock.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
          const bold = part.match(/^\*\*(.+)\*\*$/);
          return bold ? <strong key={i}>{bold[1]}</strong> : part;
        });
        
        return <p key={idx}>{parts}</p>;
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ArticleDetail() {
  const { id }     = useParams();

  // Article data
  const [article, setArticle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  // Related articles (fetched from API)
  const [related,        setRelated]        = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Reading progress + sticky header
  const [progress,     setProgress]     = useState(0);
  const [copyDone,     setCopyDone]     = useState(false);

  // Save / bookmark
  const [saved,        setSaved]        = useState(false);

  // Table of contents
  const [headings,       setHeadings]       = useState([]);
  const [activeHeading,  setActiveHeading]  = useState(null);

  // Comments
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState('');
  const [authorName,   setAuthorName]   = useState('');
  const [postPending,  setPostPending]  = useState(false);
  const [commentError, setCommentError] = useState(null);

  const contentRef   = useRef(null);
  const articleRef   = useRef(null);

  // ── Load bookmark state from localStorage ────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wsi_saved_articles') || '[]');
    setSaved(saved.some((a) => String(a.id) === String(id)));
  }, [id]);

  // ── Fetch article ────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    setArticle(null);
    setHeadings([]);

    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    fetch(`${apiBase}/api/general/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Article not found.' : `Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setArticle(data);
        // Set meta tags for SEO + social sharing
        setMetaTags({
          title:       data.title,
          description: data.excerpt,
          image:       data.image,
          url:         window.location.href,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => clearMetaTags();
  }, [id]);

  // ── Build table of contents from body ────────────────────────────────────
  useEffect(() => {
    if (!article?.body) return;
    const found = [];

    if (/<\/?[a-z][\s\S]*>/i.test(article.body) && typeof DOMParser !== 'undefined') {
      const safeHtml = sanitizeAndEnhanceHtml(article.body);
      const doc = new DOMParser().parseFromString(safeHtml, 'text/html');
      doc.querySelectorAll('h2, h3').forEach((h) => {
        const text = (h.textContent || '').trim();
        if (!text) return;
        const slug = h.getAttribute('id') || toSlug(text);
        found.push({ id: slug, text, level: h.tagName === 'H3' ? 3 : 2 });
      });
    } else {
      const re = /^#{2,3}\s+(.+)$/gm;
      let m;
      while ((m = re.exec(article.body)) !== null) {
        const text = m[1];
        const slug = toSlug(text);
        found.push({ id: slug, text, level: m[0].startsWith('###') ? 3 : 2 });
      }
    }

    setHeadings(found);
  }, [article]);

  // ── Fetch related articles from API (same section or topic) ──────────────
  useEffect(() => {
    if (!article) return;
    setRelatedLoading(true);
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const q = article.section
      ? `status=published&section=${article.section}&limit=4`
      : `status=published&limit=4`;

    fetch(`${apiBase}/api/general?${q}`)
      .then((r) => r.ok ? r.json() : { articles: [] })
      .then((data) => {
        // Exclude current article, take up to 3
        const filtered = (data.articles || [])
          .filter((a) => String(a._id) !== String(id))
          .slice(0, 3);
        setRelated(filtered);
      })
      .catch(() => setRelated([]))
      .finally(() => setRelatedLoading(false));
  }, [article, id]);

  // ── Fetch comments ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetchComments(id).then((raw) => {
      if (cancelled) return;
      const list = Array.isArray(raw) ? raw.map(normalizeComment).filter(Boolean) : [];
      setComments(list);
    });
    return () => { cancelled = true; };
  }, [id]);

  // ── Reading progress + sticky header + active heading ────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;

      // Progress bar
      const { top, height } = el.getBoundingClientRect();
      const visible = Math.max(0, Math.min(height, window.innerHeight - top));
      const scrolled = Math.max(0, -top);
      const pct = height > 0 ? Math.min(100, (scrolled / (height - window.innerHeight)) * 100) : 0;
      setProgress(Math.max(0, pct));

      // Active heading highlight in TOC
      if (!contentRef.current) return;
      const hs = contentRef.current.querySelectorAll('h2[id], h3[id]');
      let current = null;
      hs.forEach((h) => {
        if (h.getBoundingClientRect().top <= 160) current = h.getAttribute('id');
      });
      setActiveHeading(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Scroll to heading ─────────────────────────────────────────────────────
  const scrollToHeading = useCallback((slug) => {
    const el = contentRef.current?.querySelector(`#${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareArticle = (platform) => {
    const url   = window.location.href;
    const title = article?.title ?? '';
    const text  = `${title} — The Wall Street Investor`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          setCopyDone(true);
          setTimeout(() => setCopyDone(false), 2000);
        });
    }
  };

  // ── Save / bookmark ───────────────────────────────────────────────────────
  const toggleSave = () => {
    const key   = 'wsi_saved_articles';
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    const exists = store.some((a) => String(a.id) === String(id));

    let next;
    if (exists) {
      next = store.filter((a) => String(a.id) !== String(id));
      setSaved(false);
    } else {
      next = [...store, { id, title: article?.title, topic: article?.topic, savedAt: new Date().toISOString() }];
      setSaved(true);
    }
    localStorage.setItem(key, JSON.stringify(next));
  };

  // ── Post comment ──────────────────────────────────────────────────────────
  const handlePostComment = async (e) => {
    e.preventDefault();
    setCommentError(null);
    const body = commentText.trim();
    if (!body) { setCommentError('Please write something before posting.'); return; }

    setPostPending(true);
    const res = await postComment(id, { body, author: authorName });
    setPostPending(false);

    if (res.ok) {
      if (res.comment) {
        const n = normalizeComment(res.comment);
        if (n) setComments((prev) => [...prev, n]);
      } else {
        const raw = await fetchComments(id);
        setComments(Array.isArray(raw) ? raw.map(normalizeComment).filter(Boolean) : []);
      }
      setCommentText('');
    } else {
      setCommentError('Could not post your comment. Please try again.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render: loading
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="article-detail-wrapper">
        <article className="article-detail">
          <div className="article-container">
            <div className="article-header">
              <Skeleton h={12} w="20%" />
              <Skeleton h={40} />
              <Skeleton h={40} w="75%" />
              <Skeleton h={14} w="40%" style={{ marginTop: 16 }} />
            </div>
            <Skeleton h={14} />
            <Skeleton h={14} />
            <Skeleton h={14} w="90%" />
            <Skeleton h={14} w="80%" />
            <Skeleton h={14} />
            <Skeleton h={14} w="95%" style={{ marginBottom: 32 }} />
            <Skeleton h={22} w="45%" style={{ marginBottom: 20 }} />
            <Skeleton h={14} />
            <Skeleton h={14} w="85%" />
            <Skeleton h={14} />
          </div>
        </article>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: error / not found
  // ─────────────────────────────────────────────────────────────────────────
  if (error || !article) {
    return (
      <div className="article-detail-wrapper">
        <article className="article-detail">
          <div className="article-container">
            <p className="article-error">
              {error || 'Article not found.'}{' '}
              <Link to="/">Return to home →</Link>
            </p>
          </div>
        </article>
      </div>
    );
  }

  const bodyText    = article.body || article.content || '';
  const calcReadTime = readingTime(bodyText);

  // ─────────────────────────────────────────────────────────────────────────
  // Render: article
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Reading progress bar (fixed, top of viewport) ─────────────── */}
      <div className="reading-progress-bar" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="article-detail-wrapper" ref={articleRef}>

        {/* ── Left sidebar: Table of contents ───────────────────────────── */}
        {headings.length > 0 && (
          <aside className="article-sidebar" aria-label="Table of contents">
            <nav className="headings-nav">
              <p className="headings-label">On this page</p>
              <ul>
                {headings.map((h) => (
                  <li
                    key={h.id}
                    className={`${activeHeading === h.id ? 'active' : ''} ${h.level === 3 ? 'toc-sub' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => scrollToHeading(h.id)}
                      className="heading-link"
                    >
                      {h.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* ── Article main content ───────────────────────────────────────── */}
        <article className="article-detail">
          <div className="article-container">
            {/* Breadcrumb */}
            <nav className="article-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              {article.section && (
                <>
                  <span className="breadcrumb-sep">›</span>
                  <Link to={`/${article.section}`}>
                    {article.section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Link>
                </>
              )}
              <span className="breadcrumb-sep">›</span>
              <span>{article.topic}</span>
            </nav>

            <p className="article-topic">{article.topic}</p>
            <h1 className="article-title-main">{article.title}</h1>

            {article.excerpt && (
              <p className="article-excerpt">{article.excerpt}</p>
            )}

            <div className="article-meta-enhanced">
              <span className="author-info">By {article.author || 'Editorial Staff'}</span>
              <span className="separator">·</span>
              <time className="publish-date" dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span className="separator">·</span>
              <span className="reading-time">{calcReadTime}</span>
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${encodeURIComponent(tag)}`}
                    className="article-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Lead image belongs to content flow, not header block */}
            {article.image && (
              <figure className="article-content-lead-image">
                <img
                  src={article.image}
                  alt={article.title}
                  className="article-content-lead-image__img"
                  loading="lazy"
                />
              </figure>
            )}

            {/* Body */}
            <ArticleBody body={bodyText} contentRef={contentRef} />

            {/* Tags (bottom of article — second discovery point) */}
            {article.tags?.length > 0 && (
              <div className="article-tags article-tags--bottom">
                <span className="tags-label">Topics:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${encodeURIComponent(tag)}`}
                    className="article-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* ── Share section ───────────────────────────────────────── */}
            <div className="article-share-section">
              <div className="share-divider" />
              <p className="share-label">Share this article</p>
              <div className="share-buttons">
                <button type="button" className="share-btn twitter"  onClick={() => shareArticle('twitter')}>
                  𝕏 Twitter
                </button>
                <button type="button" className="share-btn linkedin" onClick={() => shareArticle('linkedin')}>
                  in LinkedIn
                </button>
                <button type="button" className="share-btn facebook" onClick={() => shareArticle('facebook')}>
                  f Facebook
                </button>
                <button type="button" className="share-btn email"    onClick={() => shareArticle('email')}>
                  ✉ Email
                </button>
                <button type="button" className="share-btn copy"     onClick={() => shareArticle('copy')}>
                  {copyDone ? '✓ Copied!' : '⎘ Copy link'}
                </button>
              </div>

              {/* Save for later */}
              <button
                type="button"
                className={`save-btn ${saved ? 'save-btn--saved' : ''}`}
                onClick={toggleSave}
              >
                {saved ? '★ Saved to reading list' : '☆ Save for later'}
              </button>
            </div>

            {/* ── Comments section ────────────────────────────────────── */}
            <div className="article-comments-section">
              <div className="comments-divider" />
              <h2 className="comments-title">Thoughts &amp; Responses</h2>

              <form className="comment-form" onSubmit={handlePostComment}>
                <div className="comment-author-row">
                  <input
                    type="text"
                    className="comment-author-input"
                    placeholder="Your name (optional)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <textarea
                  placeholder="Share your thoughts about this article…"
                  className="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                <div className="comment-form-footer">
                  <span className="comment-char-count">
                    {commentText.length} / 2000
                  </span>
                  {commentError && (
                    <p className="comment-error">{commentError}</p>
                  )}
                  <button type="submit" className="submit-comment-btn" disabled={postPending}>
                    {postPending ? 'Posting…' : 'Post Comment'}
                  </button>
                </div>
              </form>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments-message">Be the first to share your thoughts.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-item__meta">
                        <span className="comment-item__author">{c.author}</span>
                        <span> · {formatCommentDate(c.createdAt)}</span>
                      </div>
                      <p className="comment-item__body">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Related articles ─────────────────────────────────────── */}
            {!relatedLoading && related.length > 0 && (
              <div className="article-related-section">
                <div className="related-divider" />
                <h2 className="related-title">Keep Reading</h2>
                <div className="related-articles-grid">
                  {related.map((rel) => {
                    const relReadTime = readingTime(rel.body || '');
                    return (
                      <article key={rel._id} className="related-article-card">
                        <div className="related-image-wrapper">
                          {rel.image && (
                            <img
                              src={rel.image}
                              alt={rel.title}
                              className="related-article-img"
                              loading="lazy"
                            />
                          )}
                          <div className="related-article-badge">
                            <span className="badge-icon">🕐</span>
                            {relReadTime}
                          </div>
                        </div>
                        <div className="related-article-body">
                          <p className="related-topic">{rel.topic}</p>
                          <h3 className="related-title-text">{rel.title}</h3>
                          {rel.excerpt && (
                            <p className="related-excerpt">{rel.excerpt}</p>
                          )}
                          <Link
                            to={`/article/${rel._id}`}
                            className="read-related-btn"
                          >
                            Read Article →
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </article>
      </div>
    </>
  );
}