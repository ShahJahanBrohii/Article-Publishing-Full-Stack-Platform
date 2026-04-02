import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComments, postComment } from '../lib/api';
import '../styles/ArticleDetail.css';

const RELATED_POOL = [
  { id: 1, topic: 'History & Culture', title: 'The Lost Libraries of the Ancient World' },
  { id: 2, topic: 'Philosophy', title: 'What Does It Mean to Live Well?' },
  { id: 3, topic: 'Personal Essay', title: 'Why I Still Carry a Notebook in 2025' },
];

function normalizeComment(c) {
  if (!c) return null;
  return {
    id: String(c.id ?? `c-${Math.random()}`),
    author: c.author || 'Reader',
    body: c.body || c.text || '',
    createdAt: c.createdAt || c.created_at || new Date().toISOString(),
  };
}

function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState(null);
  const contentRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [postPending, setPostPending] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    fetchArticle(id);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await fetchComments(id);
      const list = Array.isArray(raw) ? raw.map(normalizeComment).filter(Boolean) : [];
      if (!cancelled) setComments(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (article && article.content) {
      const headingRegex = /^###\s+(.+)$/gm;
      const foundHeadings = [];
      let match;

      while ((match = headingRegex.exec(article.content)) !== null) {
        foundHeadings.push({
          id: match[1].toLowerCase().replace(/\s+/g, '-'),
          text: match[1],
        });
      }
      setHeadings(foundHeadings);
    }
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const headingElements = contentRef.current.querySelectorAll('h3');
      let currentHeading = null;

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) {
          currentHeading = element.getAttribute('id');
        }
      });

      setActiveHeading(currentHeading);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const fetchArticle = async (articleId) => {
    const root = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const url = root ? `${root}/api/articles/${articleId}` : `/api/articles/${articleId}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else {
        setArticle(getMockArticle(articleId));
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setArticle(getMockArticle(articleId));
    } finally {
      setLoading(false);
    }
  };

  const getMockArticle = (articleId) => {
    const mockArticles = {
      1: {
        id: 1,
        topic: 'History & Culture',
        title: 'The Lost Libraries of the Ancient World',
        excerpt:
          'From Alexandria to Antioch — a journey through the great repositories of human knowledge that time swallowed whole.',
        content: `From Alexandria to Antioch — a journey through the great repositories of human knowledge that time swallowed whole.

### The Library of Alexandria

The Library of Alexandria stands as mythology in our collective memory, a symbol of human achievement and tragic loss. But beyond this famous repository, numerous libraries and archives throughout the ancient world served as guardians of knowledge that shaped civilizations.

In this exploration, we traverse the corridors of history to discover the great centers of learning that once flourished across the Mediterranean and beyond. From the Library of Pergamon to the archives of Mesopotamia, these institutions were the Internet of their time—nodes in a vast network of knowledge exchange.

### The Library of Pergamon

Yet many vanished without trace, their contents consumed by fire, warfare, or the relentless march of time. What wisdom was lost? What insights might have accelerated human progress? These questions haunt us still.

### Mesopotamian Archives

The ancient civilizations of Mesopotamia developed extensive record-keeping systems that preserved knowledge on clay tablets. These archives contained everything from legal codes to astronomical observations, demonstrating the sophisticated nature of ancient scholarship and administration.

### The Legacy Lost

The loss of these great repositories represents an irreplaceable tragedy for human civilization. We can only imagine what knowledge and wisdom perished in the flames.`,
      },
      2: {
        id: 2,
        topic: 'Philosophy',
        title: 'What Does It Mean to Live Well?',
        excerpt:
          'Stoics, existentialists, and the quiet wisdom of ordinary people converge in this meditation on the good life.',
        content: `Stoics, existentialists, and the quiet wisdom of ordinary people converge in this meditation on the good life.

### The Question Explored

The question has echoed through millennia: What constitutes a well-lived life? Different traditions have offered different answers, yet certain threads connect them all—the search for meaning, the cultivation of virtue, and the alignment of action with principle.

### Stoic Philosophy

Marcus Aurelius meditated on duty; Epictetus taught acceptance of what lies beyond control. The Stoics understood that true freedom comes not from external circumstances, but from our response to them.

### Existentialist Perspective

Later, existentialists emphasized our freedom to create meaning. Yet perhaps the ancients were wiser than we give them credit for. A well-lived life, they seemed to suggest, is not about accumulation or achievement alone, but about becoming fully human—aware, authentic, and responsible.

### Modern Applications

In our contemporary world, we struggle with the same questions. How do we find meaning? How do we live authentically? The wisdom of ancient philosophy offers us guidance in navigating these timeless questions.`,
      },
      3: {
        id: 3,
        topic: 'Personal Essay',
        title: 'Why I Still Carry a Notebook in 2025',
        excerpt:
          'In an age of digital everything, there is something quietly radical about writing by hand — and refusing to stop.',
        content: `In an age of digital everything, there is something quietly radical about writing by hand — and refusing to stop.

### A Leather-Bound Companion

My notebook is leather-bound, weathered from years of travel. Its pages are filled with slanted handwriting, crossed-out sentences, margin notes. By modern standards, it's inefficient. No search function, no cloud backup, no way to quickly share ideas with others.

### The Power of Handwriting

Yet I cannot imagine abandoning it. Something happens when pen meets paper that doesn't happen when fingers meet keyboard. The mind slows. Thoughts deepen. Ideas emerge that might otherwise remain buried in the noise of digital distraction.

### Resistance to Technology

This is not nostalgia. It is a conscious choice to resist the tyranny of optimization, to embrace the friction that fosters depth. In a world obsessed with speed and efficiency, the act of writing by hand becomes a radical assertion of values that run counter to the prevailing tide.

### The Future of Reflection

As we continue to advance technologically, the simple practice of handwriting becomes increasingly counter-cultural—and increasingly necessary.`,
      },
    };
    const key = Number(articleId);
    return mockArticles[key];
  };

  const scrollToHeading = (headingId) => {
    const element = contentRef.current?.querySelector(`#${headingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const shareArticle = (platform) => {
    const url = window.location.href;
    const title = article.title;
    const text = `${article.title} - Come Read with Junaid`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    setCommentError(null);
    const body = commentText.trim();
    if (!body) {
      setCommentError('Please write something before posting.');
      return;
    }
    setPostPending(true);
    const res = await postComment(id, { body, author: authorName });
    setPostPending(false);

    if (res.ok) {
      setCommentError(null);
      if (res.comment) {
        const n = normalizeComment(res.comment);
        if (n) setComments((prev) => [...prev, n]);
      } else {
        const raw = await fetchComments(id);
        const list = Array.isArray(raw) ? raw.map(normalizeComment).filter(Boolean) : [];
        setComments(list);
      }
      setCommentText('');
    } else {
      setCommentError('Could not post your comment.');
    }
  };

  const relatedArticles = RELATED_POOL.filter((a) => String(a.id) !== String(id)).slice(0, 2);

  const formatCommentDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="article-detail">
        <p>Loading...</p>
      </div>
    );
  }
  if (!article) {
    return (
      <div className="article-detail">
        <p>Article not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="article-detail-wrapper">
        {headings.length > 0 && (
          <aside className="article-sidebar">
            <nav className="headings-nav">
              <p className="headings-label">On this page</p>
              <ul>
                {headings.map((heading) => (
                  <li key={heading.id} className={activeHeading === heading.id ? 'active' : ''}>
                    <button type="button" onClick={() => scrollToHeading(heading.id)} className="heading-link">
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        <article className="article-detail">
          <div className="article-container" ref={contentRef}>
            <div className="article-header">
              <p className="article-topic">{article.topic}</p>
              <h1 className="article-title-main">{article.title}</h1>
              <div className="article-meta-enhanced">
                <span className="author-info">By {article.author || 'Editorial Staff'}</span>
                <span className="separator">•</span>
                <span className="publish-date">{article.publishedAt || 'March 27, 2026'}</span>
                <span className="separator">•</span>
                <span className="reading-time">{article.readingTime || '5 min read'}</span>
              </div>
            </div>

            <div className="article-content">
              {article.content.split('\n\n').map((paragraph, idx) => {
                const headingMatch = paragraph.match(/^###\s+(.+)$/);
                if (headingMatch) {
                  const headingText = headingMatch[1];
                  const headingId = headingText.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <h3 key={idx} id={headingId} className="article-heading">
                      {headingText}
                    </h3>
                  );
                }
                if (paragraph.trim()) {
                  return <p key={idx}>{paragraph}</p>;
                }
                return null;
              })}
            </div>

            <div className="article-share-section">
              <div className="share-divider"></div>
              <p className="share-label">Share this article</p>
              <div className="share-buttons">
                <button type="button" className="share-btn twitter" onClick={() => shareArticle('twitter')} title="Share on Twitter">
                  𝕏 Twitter
                </button>
                <button type="button" className="share-btn facebook" onClick={() => shareArticle('facebook')} title="Share on Facebook">
                  f Facebook
                </button>
                <button type="button" className="share-btn email" onClick={() => shareArticle('email')} title="Share via Email">
                  ✉ Email
                </button>
                <button type="button" className="share-btn copy" onClick={() => shareArticle('copy')} title="Copy link">
                  🔗 Copy Link
                </button>
              </div>
            </div>

            <div className="article-comments-section">
              <div className="comments-divider"></div>
              <h3 className="comments-title">Thoughts & Responses</h3>
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
                  placeholder="Share your thoughts about this article..."
                  className="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
                {commentError && (
                  <p className="comment-error" style={{ color: '#a03030', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {commentError}
                  </p>
                )}
                <button type="submit" className="submit-comment-btn" disabled={postPending}>
                  {postPending ? 'Posting…' : 'Post Comment'}
                </button>
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

            {relatedArticles.length > 0 && (
              <div className="article-related-section">
                <div className="related-divider"></div>
                <h3 className="related-title">Keep Reading</h3>
                <div className="related-articles-grid">
                  {relatedArticles.map((related) => (
                    <article key={related.id} className="related-article-card">
                      <p className="related-topic">{related.topic}</p>
                      <h4 className="related-title-text">{related.title}</h4>
                      <button type="button" onClick={() => navigate(`/article/${related.id}`)} className="read-related-btn">
                        Read Article →
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}

export default ArticleDetail;
