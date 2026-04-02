import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { SECTION_IDS, getSection, getTopic } from '../data/sections';
import '../styles/SectionPage.css';

function SectionPage({ sectionId }) {
  const { topicSlug } = useParams();

  if (!sectionId || !SECTION_IDS.includes(sectionId)) {
    return <Navigate to="/" replace />;
  }

  const section = getSection(sectionId);
  const topic = topicSlug ? getTopic(sectionId, topicSlug) : null;

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
        <div className="section-page__inner section-page__inner--narrow">
          <p className="section-page__label">
            <Link to={`/${sectionId}`}>{section.title}</Link>
            <span className="section-page__crumb"> / </span>
            <span>{topic.title}</span>
          </p>
          <h1 className="section-page__title">{topic.title}</h1>
          <p className="section-page__lede">{topic.blurb}</p>
          <div className="section-page__actions">
            {topic.relatedArticleId && (
              <Link to={`/article/${topic.relatedArticleId}`} className="section-page__cta">
                Read a related article →
              </Link>
            )}
            <Link to={`/${sectionId}`} className="section-page__cta section-page__cta--ghost">
              All topics in {section.title}
            </Link>
          </div>
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
