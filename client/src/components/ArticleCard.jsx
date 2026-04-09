import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function ArticleCard({ id, topic, title, excerpt, author, readTime, image }) {
  const navigate = useNavigate();

  // Handle card click — navigate to article detail
  const handleCardClick = (e) => {
    // Don't navigate if clicking a link (let the link handle it)
    if (e.target.closest('a')) return;
    navigate(`/article/${id}`);
  };

  return (
    <div className="card" onClick={handleCardClick} role="button" tabIndex={0} aria-label={`Read article: ${title}`}>
      {image && (
        <div className="card-image-wrap" aria-hidden="true">
          <img src={image} alt="" className="card-image" loading="lazy" />
        </div>
      )}
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