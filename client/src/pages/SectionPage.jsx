import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SECTION_IDS, getSection, getTopic } from '../data/sections';
import ArticleCard from '../components/ArticleCard';
import '../styles/Home.css';
import '../styles/SectionPage.css';

function readingTime(body = '') {
  const words = body.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / 200) + ' min read';
}

function SectionPage({ sectionId }) {   
  const { topicSlug } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const section = getSection(sectionId);
  const topic = topicSlug ? getTopic(sectionId, topicSlug) : null;

  // Fetch articles for this section/topic
  useEffect(() => {
    if (!sectionId || !SECTION_IDS.includes(sectionId)) return;

    setLoading(true);
    setError('');
    
    const query = new URLSearchParams({
      section: sectionId,
      status: 'published',
      limit: 50,
    });
    
    if (topicSlug) {
      query.append('topic', topicSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    }

    fetch(`${import.meta.env.VITE_API_URL || ''}/api/general?${query}`)
      .then(res => res.json())
      .then(data => setArticles(data.articles || []))
      .catch(err => setError('Could not load articles'))
      .finally(() => setLoading(false));
  }, [sectionId, topicSlug]);

  if (!sectionId || !SECTION_IDS.includes(sectionId)) {
    return <Navigate to="/" replace />;
  }

  if (topicSlug && !topic) {
    return (
      <div className="section-page">
        <div className="section-page__inner">
          <p className="section-page__notfound">Topic not found.</p>
          <Link to={`/${sectionId}`} className="section-page__back">
            ← Back to {section.title}
          </Link>
        </div>
      </div>
    );
  }

  if (topic) {
    return (
      <div className="section-page">
        <div className="section-page__inner">
          <p className="section-page__label">
            <Link to={`/${sectionId}`}>{section.title}</Link>
            <span className="section-page__crumb"> / </span>
            <span>{topic.title}</span>
          </p>
          <h1 className="section-page__title">{topic.title}</h1>
          <p className="section-page__lede">{topic.blurb}</p>
          <div className="section-page__actions">
            <Link to={`/${sectionId}`} className="section-page__cta section-page__cta--ghost">
              ← All topics in {section.title}
            </Link>
          </div>

          {error && <p className="section-page__error">{error}</p>}
          
          <div className="section-page__rule" />

          {loading ? (
            <p className="section-page__loading">Loading articles…</p>
          ) : articles.length === 0 ? (
            <p className="section-page__empty">No articles in this topic yet.</p>
          ) : (
            <div className="section-page__articles">
              {articles.map(article => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <div className="section-page__inner">
        <p className="section-page__kicker">{section.kicker}</p>
        <h1 className="section-page__title">{section.title}</h1>
        <p className="section-page__lede section-page__lede--intro">{section.description}</p>

        <div className="section-page__rule" />

        {error && <p className="section-page__error">{error}</p>}

        {loading ? (
          <p className="section-page__loading">Loading articles…</p>
        ) : articles.length > 0 ? (
          <>
            <h2 className="section-page__subtitle">Recent Articles</h2>
            <div className="section-page__articles">
              {articles.map(article => (
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

            <div className="section-page__rule" />
          </>
        ) : null}

        <h2 className="section-page__subtitle">Explore Topics</h2>
        <ul className="section-page__topics">
          {section.topics.map((t) => (
            <li key={t.slug}>
              <Link to={`/${sectionId}/${t.slug}`} className="section-page__topic-link">
                <span className="section-page__topic-title">{t.title}</span>
                <span className="section-page__topic-blurb">{t.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SectionPage;
