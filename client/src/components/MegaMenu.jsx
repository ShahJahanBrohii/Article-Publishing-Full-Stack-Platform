import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../lib/slug';

function MegaMenu({ id, cols, columns, basePath }) {
  const prefix = basePath || '';

  return (
    <div className="mega-menu" id={id}>
      <div className={`mega-inner cols-${cols}`}>
        {columns.map((col, idx) => (
          col.isFeature ? (
            <div key={idx} className="mega-col mega-feature">
              <div className="mega-feature-label">{col.label}</div>
              <div className="mega-feature-title">{col.title}</div>
              <div className="mega-feature-desc">{col.desc}</div>
            </div>
          ) : (
            <div key={idx} className="mega-col">
              <div className="mega-col-label">{col.label}</div>
              {col.items.map((item, itemIdx) => {
                const to = `${prefix}/${slugify(item)}`;
                return (
                  <Link key={itemIdx} to={to}>
                    {item}
                  </Link>
                );
              })}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default MegaMenu;
