import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ id, topic, title, excerpt }) {
  return (
    <div className="card">
      <p className="card-topic">{topic}</p>
      <h3 className="card-title">{title}</h3>
      <p className="card-excerpt">{excerpt}</p>
      <Link to={`/article/${id}`} className="card-read-more">Read Article →</Link>
    </div>
  );
}

export default ArticleCard;
