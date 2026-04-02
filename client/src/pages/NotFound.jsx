import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__text">That URL doesn’t match any story or section.</p>
      <Link to="/" className="not-found__link">
        Return to the front page →
      </Link>
    </div>
  );
}

export default NotFound;
