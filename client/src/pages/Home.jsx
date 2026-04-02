import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { subscribeEmail } from '../lib/api';
import '../styles/Home.css';



// ─── Small helper: derive reading time from body word count ───────────────
function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
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

    fetch(`${apiBase}/api/articles?status=published&limit=6`)
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

  // ── Deduplicate opinion pieces by headline (guards against admin mistakes) ─
  const uniqueOpinions = opinionPieces.filter(
    (op, idx, arr) => arr.findIndex((o) => o.headline === op.headline) === idx
  );

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

          {!contentLoading && sidebarNews.length === 0 && !contentError && (
            <p className="home-empty-note">No latest items yet.</p>
          )}

          {!contentLoading &&
            sidebarNews.map((item, i) => (
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
                  {hero.headline || 'From Knowledge to Financial Freedom'}
                </h1>

                {hero.subheadline && (
                  <p className="hero-lead__subhead">{hero.subheadline}</p>
                )}

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

            {!contentLoading && uniqueOpinions.length === 0 && !contentError && (
              <p className="home-empty-note">No opinion pieces yet.</p>
            )}

            {!contentLoading &&
              uniqueOpinions.map((op, i) => (
                <Link
                  key={i}
                  to={op.to || '/'}
                  className={`opinion-item opinion-item--link ${
                    i === uniqueOpinions.length - 1 ? 'opinion-item--last' : ''
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
            <div className="newsletter__heading">Morning Briefing</div>
            <p className="newsletter__copy">
              Five financial insights in your inbox every morning. No noise, no spam.
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