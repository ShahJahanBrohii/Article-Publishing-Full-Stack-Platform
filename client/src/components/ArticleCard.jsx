import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ id, topic, title, excerpt, author, readTime }) {
  return (
    <div className="card">
      <p className="card-topic">{topic}</p>
      <h3 className="card-title">{title}</h3>
      <p className="card-excerpt">{excerpt}</p>

      {/* Author + read time — only rendered if provided */}
      {(author || readTime) && (
        <div className="card-meta">
          {author && <span className="card-meta__author">{author}</span>}
          {author && readTime && <span className="card-meta__dot">·</span>}
          {readTime && <span className="card-meta__time">{readTime}</span>}
        </div>
      )}

      <Link to={`/article/${id}`} className="card-read-more" aria-label={`Read article: ${title}`}>
        Read Article →
      </Link>
    </div>
  );
}

export default ArticleCard;