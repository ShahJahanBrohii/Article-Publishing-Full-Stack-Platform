import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { subscribeEmail } from '../lib/api';
import { useSiteSettings } from '../lib/siteSettings';
import '../styles/Home.css';



// ─── Small helper: derive reading time from body word count ───────────────
function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function relativeTime(iso) {
  if (!iso) return 'Recently';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Recently';

  const diffMs = Date.now() - parsed.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function titleCaseSection(section = '') {
  return String(section)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Skeleton placeholder shown while data loads ──────────────────────────
function SkeletonBlock({ height = 16, width = '100%', style = {} }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 4,
        background: 'var(--skeleton-bg, rgba(128,128,128,0.12))',
        marginBottom: 8,
        ...style,
      }}
    />
  );
}

export default function Home() {
  const { settings } = useSiteSettings();

  // ── CMS content from GET /api/home ──────────────────────────────────────
  const [homeContent,    setHomeContent]    = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError,   setContentError]   = useState(null);

  // ── Published articles from GET /api/articles ───────────────────────────
  const [articles,        setArticles]        = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError,   setArticlesError]   = useState(null);

  // ── Newsletter form ──────────────────────────────────────────────────────
  const [newsletterEmail,   setNewsletterEmail]   = useState('');
  const [newsletterStatus,  setNewsletterStatus]  = useState(null);
  const [newsletterPending, setNewsletterPending] = useState(false);

  // ── Fetch /api/home ──────────────────────────────────────────────────────
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    fetch(`${apiBase}/api/home`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setHomeContent(data);
        setContentError(null);
      })
      .catch((err) => setContentError(err.message))
      .finally(() => setContentLoading(false));
  }, []);

  // ── Fetch published articles ─────────────────────────────────────────────
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    fetch(`${apiBase}/api/general?status=published&limit=30`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // Public articles endpoint returns { articles, total, pages }
        // (same shape as admin endpoint, but only published ones)
        setArticles(data.articles ?? []);
        setArticlesError(null);
      })
      .catch((err) => setArticlesError(err.message))
      .finally(() => setArticlesLoading(false));
  }, []);

  // ── Scroll to featured section ───────────────────────────────────────────
  const scrollToFeatured = (e) => {
    e.preventDefault();
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Newsletter submit ────────────────────────────────────────────────────
  const handleNewsletter = async (e) => {
    e.preventDefault();
    setNewsletterPending(true);
    setNewsletterStatus(null);
    const result = await subscribeEmail(newsletterEmail, 'home-morning-briefing');
    setNewsletterPending(false);
    if (result.ok) {
      setNewsletterStatus({ ok: true, local: result.local });
      setNewsletterEmail('');
    } else {
      setNewsletterStatus({ ok: false, message: result.error || 'Something went wrong.' });
    }
  };

  // ── Destructure CMS data (with safe fallbacks) ───────────────────────────
  const hero          = homeContent?.hero          ?? {};
  const sidebarNews   = homeContent?.sidebarNews   ?? [];
  const opinionPieces = homeContent?.opinionPieces ?? [];
  const mostRead      = homeContent?.mostRead      ?? [];

  const manualLatest = sidebarNews
    .filter((item) => item?.headline)
    .map((item) => ({
      category: item.category || 'Latest',
      headline: item.headline,
      time: item.time || 'Recently',
      to: item.to || '/',
    }));

  const autoLatest = articles.map((article) => ({
    category: article.section ? titleCaseSection(article.section) : (article.topic || 'Latest'),
    headline: article.title,
    time: relativeTime(article.publishedAt || article.createdAt),
    to: `/article/${article._id}`,
  }));

  const latestItems = [
    ...manualLatest,
    ...autoLatest.filter((a) => !manualLatest.some((m) => m.headline === a.headline)),
  ].slice(0, 5);

  const manualOpinions = opinionPieces
    .filter((op) => op?.headline)
    .map((op) => ({
      headline: op.headline,
      excerpt: op.excerpt || '',
      author: op.author || 'Editorial',
      bio: op.bio || '',
      to: op.to || '/',
    }));

  const opinionTagged = articles.filter((article) => {
    const section = String(article.section || '');
    const topic = String(article.topic || '');
    const tags = Array.isArray(article.tags) ? article.tags.join(' ') : '';
    return /opinion/i.test(`${section} ${topic} ${tags}`);
  });

  const fallbackOpinionPool = opinionTagged.length ? opinionTagged : articles;

  const autoOpinions = fallbackOpinionPool.map((article) => ({
    headline: article.title,
    excerpt: article.excerpt || '',
    author: article.author || 'Editorial',
    bio: article.section ? titleCaseSection(article.section) : '',
    to: `/article/${article._id}`,
  }));

  const opinionItems = [
    ...manualOpinions,
    ...autoOpinions.filter((a) => !manualOpinions.some((m) => m.headline === a.headline)),
  ].slice(0, 3);

  return (
    <div className="home">

     

      {/* ── Top-level error banner ───────────────────────────────────────── */}
      {contentError && (
        <div className="home-error-banner" role="alert">
          Could not load page content — {contentError}. Please refresh.
        </div>
      )}

      <div className="hero-grid">

        {/* ── Left sidebar: Latest news ────────────────────────────────── */}
        <aside className="hero-grid__left">
          <div className="section-header section-header--thick">
            <span>Latest</span>
          </div>

          {contentLoading && (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="sidebar-item" style={{ cursor: 'default' }}>
                  <SkeletonBlock height={10} width="40%" />
                  <SkeletonBlock height={14} />
                  <SkeletonBlock height={10} width="25%" />
                </div>
              ))}
            </>
          )}

          {!contentLoading && latestItems.length === 0 && (
            <p className="home-empty-note">No latest items yet.</p>
          )}

          {!contentLoading &&
            latestItems.map((item, i) => (
              <Link key={i} to={item.to || '/'} className="sidebar-item sidebar-item--link">
                <span className="sidebar-item__cat">{item.category}</span>
                <h4 className="sidebar-item__headline">{item.headline}</h4>
                <span className="sidebar-item__time">{item.time}</span>
              </Link>
            ))}
        </aside>

        {/* ── Centre: Hero lead story ──────────────────────────────────── */}
        <main className="hero-grid__center">
          <div className="hero-lead">
            {contentLoading ? (
              <>
                <SkeletonBlock height={12} width="30%" />
                <SkeletonBlock height={32} />
                <SkeletonBlock height={32} width="80%" />
                <SkeletonBlock height={16} width="60%" />
                <SkeletonBlock height={220} style={{ borderRadius: 8, margin: '16px 0' }} />
                <SkeletonBlock height={14} />
                <SkeletonBlock height={14} />
                <SkeletonBlock height={14} width="70%" />
              </>
            ) : (
              <>
                <div className="hero-lead__cat">
                  <span className="cat-tag cat-tag--accent">
                    {hero.category || 'Investing'}
                  </span>
                </div>

                <h1 className="hero-lead__headline">
                  {hero.headline || "From ‘Knowledge’ to ‘Financial Freedom’"}
                </h1>

                <p className="hero-lead__subhead">
                  {hero.subheadline || 'Practical Insights on investing, personal finance, and financial education - helping you understand how money works and how wealth is built'}
                </p>

                <div className="hero-lead__meta">
                  {hero.author && (
                    <span className="hero-lead__author">{hero.author}</span>
                  )}
                  {hero.author && hero.date && (
                    <span className="hero-lead__dot">·</span>
                  )}
                  {hero.date && <span>{hero.date}</span>}
                  {hero.readTime && (
                    <>
                      <span className="hero-lead__dot">·</span>
                      <span>{hero.readTime}</span>
                    </>
                  )}
                </div>

                {hero.image && (
                  <div className="hero-lead__img-wrap">
                    <img
                      className="hero-lead__img"
                      src={hero.image}
                      alt={hero.headline || 'Hero article image'}
                    />
                  </div>
                )}

                {hero.caption && (
                  <p className="hero-lead__caption">{hero.caption}</p>
                )}

                {/* Render body — supports multiple paragraphs separated by \n\n */}
                {hero.body &&
                  hero.body.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i} className="hero-lead__body">{para}</p>
                  ))}

                <a
                  href="#featured"
                  className="hero-lead__cta"
                  onClick={scrollToFeatured}
                >
                  Read Full Story →
                </a>
              </>
            )}
          </div>
        </main>

        {/* ── Right sidebar: Opinion + Most Read + Newsletter ──────────── */}
        <aside className="hero-grid__right">

          {/* Opinion */}
          <div className="right-block">
            <div className="section-header section-header--thick">
              <span>Opinion</span>
            </div>

            {contentLoading && (
              <>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="opinion-item" style={{ paddingBottom: 16 }}>
                    <SkeletonBlock height={14} />
                    <SkeletonBlock height={12} />
                    <SkeletonBlock height={10} width="50%" />
                  </div>
                ))}
              </>
            )}

            {!contentLoading && opinionItems.length === 0 && (
              <p className="home-empty-note">No opinion pieces yet.</p>
            )}

            {!contentLoading &&
              opinionItems.map((op, i) => (
                <Link
                  key={i}
                  to={op.to || '/'}
                  className={`opinion-item opinion-item--link ${
                    i === opinionItems.length - 1 ? 'opinion-item--last' : ''
                  }`}
                >
                  <h4 className="opinion-item__headline">{op.headline}</h4>
                  <p className="opinion-item__excerpt">"{op.excerpt}"</p>
                  <div className="opinion-item__byline">
                    <span className="opinion-item__author">{op.author}</span>
                    {op.bio && (
                      <span className="opinion-item__bio"> / {op.bio}</span>
                    )}
                  </div>
                </Link>
              ))}
          </div>

          <div className="divider" />

          {/* Most Read */}
          <div className="right-block">
            <div className="section-header section-header--thick">
              <span>Most Read</span>
            </div>

            {contentLoading && (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="popular-item" style={{ display: 'flex', gap: 10, paddingBottom: 12 }}>
                    <SkeletonBlock height={16} width={20} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <SkeletonBlock height={13} />
                      <SkeletonBlock height={10} width="35%" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {!contentLoading && mostRead.length === 0 && !contentError && (
              <p className="home-empty-note">No most-read items yet.</p>
            )}

            {!contentLoading &&
              mostRead.map((item, i) => {
                const inner = (
                  <>
                    <span className="popular-item__number">{i + 1}</span>
                    <div>
                      <h4 className="popular-item__headline">{item.headline}</h4>
                      <span className="popular-item__views">{item.views} readers</span>
                    </div>
                  </>
                );
                const cls = `popular-item popular-item--link ${
                  i === mostRead.length - 1 ? 'popular-item--last' : ''
                }`;
                const linkTo = item.articleId
                  ? `/article/${item.articleId}`
                  : item.to || '/';
                return (
                  <Link key={i} to={linkTo} className={cls}>
                    {inner}
                  </Link>
                );
              })}
          </div>

          {/* Newsletter */}
          <div className="newsletter">
            <div className="newsletter__heading">{settings?.newsletterTitle || 'Morning Briefing'}</div>
            <p className="newsletter__copy">
              {settings?.newsletterSubtitle || 'Five financial insights in your inbox every morning. No noise, no spam.'}
            </p>

            {newsletterStatus?.ok && (
              <p className="newsletter__feedback newsletter__feedback--ok">
                {newsletterStatus.local
                  ? "You're on the list. (Saved locally until the server is connected.)"
                  : "You're subscribed — thank you."}
              </p>
            )}
            {newsletterStatus && !newsletterStatus.ok && (
              <p className="newsletter__feedback newsletter__feedback--err">
                {newsletterStatus.message}
              </p>
            )}

            <form className="newsletter__form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter__input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterPending}
                autoComplete="email"
              />
              <button
                type="submit"
                className="newsletter__btn"
                disabled={newsletterPending}
              >
                {newsletterPending ? '…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* ── Featured articles ─────────────────────────────────────────────── */}
      <section className="featured" id="featured">
        <p className="section-label">Hand-picked</p>
        <h2 className="section-title">Featured Articles</h2>
        <div className="section-rule" />

        {articlesError && (
          <p className="home-error-note" role="alert">
            Could not load articles — {articlesError}.
          </p>
        )}

        {articlesLoading && (
          <div className="cards">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <SkeletonBlock height={12} width="40%" />
                <SkeletonBlock height={20} />
                <SkeletonBlock height={20} width="80%" />
                <SkeletonBlock height={14} />
                <SkeletonBlock height={14} width="90%" />
                <SkeletonBlock height={14} width="60%" />
              </div>
            ))}
          </div>
        )}

        {!articlesLoading && !articlesError && articles.length === 0 && (
          <p className="home-empty-note">No published articles yet.</p>
        )}

        {!articlesLoading && !articlesError && articles.length > 0 && (
          <div className="cards">
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                id={article._id}
                image={article.image}
                topic={article.topic}
                title={article.title}
                excerpt={article.excerpt}
                author={article.author}
                readTime={readingTime(article.body)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}