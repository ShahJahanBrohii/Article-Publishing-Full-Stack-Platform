import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../styles/SearchResults.css';

const API_BASE = () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const SECTIONS = [
  { value: '',                    label: 'All Sections'        },
  { value: 'investing',           label: 'Investing'           },
  { value: 'personal-finance',    label: 'Personal Finance'    },
  { value: 'financial-education', label: 'Financial Education' },
  { value: 'guides',              label: 'Guides'              },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'views',  label: 'Most read'    },
];

function readingTime(body = '') {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return ''; }
}

// ── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="sr-card sr-card--skeleton">
      <div className="sr-skeleton sr-skeleton--topic" />
      <div className="sr-skeleton sr-skeleton--title" />
      <div className="sr-skeleton sr-skeleton--title sr-skeleton--short" />
      <div className="sr-skeleton sr-skeleton--excerpt" />
      <div className="sr-skeleton sr-skeleton--excerpt sr-skeleton--short" />
      <div className="sr-skeleton sr-skeleton--meta" />
    </div>
  );
}

// ── Single result card ─────────────────────────────────────────────────────
function ResultCard({ article }) {
  return (
    <article className="sr-card">
      {article.image && (
        <Link to={`/article/${article._id}`} className="sr-card__img-wrap" tabIndex={-1}>
          <img
            src={article.image}
            alt={article.title}
            className="sr-card__img"
            loading="lazy"
          />
        </Link>
      )}
      <div className="sr-card__body">
        <div className="sr-card__top">
          <span className="sr-card__topic">{article.topic}</span>
          {article.section && (
            <Link
              to={`/${article.section}`}
              className="sr-card__section"
            >
              {article.section.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          )}
        </div>
        <h2 className="sr-card__title">
          <Link to={`/article/${article._id}`}>{article.title}</Link>
        </h2>
        {article.excerpt && (
          <p className="sr-card__excerpt">{article.excerpt}</p>
        )}
        <div className="sr-card__meta">
          {article.author && <span className="sr-card__author">{article.author}</span>}
          {article.author && <span className="sr-card__sep">·</span>}
          {article.publishedAt && (
            <time className="sr-card__date" dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          )}
          <span className="sr-card__sep">·</span>
          <span className="sr-card__time">{readingTime(article.body)}</span>
          {article.views > 0 && (
            <>
              <span className="sr-card__sep">·</span>
              <span className="sr-card__views">{article.views.toLocaleString()} views</span>
            </>
          )}
        </div>
        {article.tags?.length > 0 && (
          <div className="sr-card__tags">
            {article.tags.map(tag => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag)}`}
                className="sr-card__tag"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read params
  const query   = searchParams.get('q')       || '';
  const tag     = searchParams.get('tag')     || '';
  const section = searchParams.get('section') || '';
  const sort    = searchParams.get('sort')    || 'newest';
  const page    = Number(searchParams.get('page') || 1);

  // Local search input (controlled separately so typing doesn't navigate immediately)
  const [inputValue, setInputValue] = useState(query);

  // Results state
  const [results,  setResults]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Sync input when URL param changes (e.g. browser back/forward)
  useEffect(() => { setInputValue(query); }, [query]);

  // ── Fetch results ────────────────────────────────────────────────────────
  const fetchResults = useCallback(async () => {
    // Need at least a query or a tag to search
    if (!query && !tag && !section) {
      setResults([]);
      setTotal(0);
      setPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = new URLSearchParams({ status: 'published', page, limit: 10 });
      if (query)   q.set('search',  query);
      if (tag)     q.set('tag', tag);
      if (section) q.set('section', section);

      const res  = await fetch(`${API_BASE()}/api/general?${q.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      let articles = data.articles ?? [];

      // Client-side sort (server returns newest-first by default)
      if (sort === 'oldest') {
        articles = [...articles].sort(
          (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
        );
      } else if (sort === 'views') {
        articles = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      }

      setResults(articles);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, tag, section, sort, page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed, sort, ...(section && { section }), ...(tag && { tag }) });
  };

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page'); // reset to page 1 on filter change
    setSearchParams(p);
  };

  const goPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Page heading text ─────────────────────────────────────────────────────
  let headingText = '';
  if (tag)   headingText = `Articles tagged "${tag}"`;
  else if (query) headingText = `Results for "${query}"`;
  else if (section) headingText = `${section.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} articles`;
  else headingText = 'Search';

  const showEmpty   = !loading && !error && results.length === 0 && (query || tag || section);
  const showResults = !loading && !error && results.length > 0;
  const showIdle    = !loading && !error && !query && !tag && !section;

  return (
    <div className="sr-page">

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="sr-hero">
        <form className="sr-form" onSubmit={handleSearchSubmit} role="search">
          <div className="sr-form__inner">
            <svg className="sr-form__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              className="sr-form__input"
              placeholder="Search articles, topics, authors…"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoComplete="off"
              autoFocus
              aria-label="Search articles"
            />
            <button type="submit" className="sr-form__btn" disabled={!inputValue.trim()}>
              Search
            </button>
          </div>
        </form>

        {/* Active tag pill */}
        {tag && !query && (
          <div className="sr-active-tag">
            <span className="sr-active-tag__label">Tag:</span>
            <span className="sr-active-tag__value">{tag}</span>
            <button
              className="sr-active-tag__remove"
              onClick={() => setSearchParams({})}
              aria-label="Clear tag filter"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="sr-layout">

        {/* ── Filters sidebar ─────────────────────────────────────────── */}
        <aside className="sr-filters" aria-label="Search filters">
          <div className="sr-filter-group">
            <p className="sr-filter-group__label">Section</p>
            {SECTIONS.map(s => (
              <button
                key={s.value}
                className={`sr-filter-btn ${section === s.value ? 'sr-filter-btn--active' : ''}`}
                onClick={() => setParam('section', s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="sr-filter-group">
            <p className="sr-filter-group__label">Sort by</p>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`sr-filter-btn ${sort === o.value ? 'sr-filter-btn--active' : ''}`}
                onClick={() => setParam('sort', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          {(query || tag || section || sort !== 'newest') && (
            <button
              className="sr-clear-btn"
              onClick={() => { setSearchParams({}); setInputValue(''); }}
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Results area ────────────────────────────────────────────── */}
        <div className="sr-results">

          {/* Heading + count */}
          {(query || tag || section) && (
            <div className="sr-results-head">
              <h1 className="sr-results-head__title">{headingText}</h1>
              {!loading && (
                <p className="sr-results-head__count">
                  {total === 0
                    ? 'No results'
                    : `${total.toLocaleString()} article${total !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="sr-list">
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="sr-error" role="alert">
              Could not load results — {error}. Please try again.
            </div>
          )}

          {/* Idle state (no query entered yet) */}
          {showIdle && (
            <div className="sr-idle">
              <p className="sr-idle__text">
                Start typing to search across all published articles.
              </p>
              <div className="sr-suggestions">
                <p className="sr-suggestions__label">Browse by section</p>
                <div className="sr-suggestions__grid">
                  {SECTIONS.slice(1).map(s => (
                    <Link
                      key={s.value}
                      to={`/search?section=${s.value}`}
                      className="sr-suggestion-card"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="sr-empty">
              <p className="sr-empty__heading">No articles found</p>
              <p className="sr-empty__sub">
                Try different keywords, or browse a section below.
              </p>
              <div className="sr-suggestions__grid sr-suggestions__grid--center">
                {SECTIONS.slice(1).map(s => (
                  <Link
                    key={s.value}
                    to={`/search?section=${s.value}`}
                    className="sr-suggestion-card"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {showResults && (
            <div className="sr-list">
              {results.map(article => (
                <ResultCard key={article._id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {showResults && pages > 1 && (
            <nav className="sr-pagination" aria-label="Search results pages">
              <button
                className="sr-page-btn"
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…'
                    ? <span key={`ellipsis-${i}`} className="sr-page-ellipsis">…</span>
                    : (
                      <button
                        key={p}
                        className={`sr-page-btn ${page === p ? 'sr-page-btn--active' : ''}`}
                        onClick={() => goPage(p)}
                        aria-current={page === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                )}

              <button
                className="sr-page-btn"
                onClick={() => goPage(page + 1)}
                disabled={page === pages}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
