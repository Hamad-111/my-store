import React from 'react';
import '../../pages/MenPage.css';

export default function MenTypeHeader({
  title = '',
  categories = [],
  activeCategory,
  onCategoryChange,
}) {
  return (
    <section className="u-type-wrapper u-type-wrapper-small men-type-like-women">
      {title ? <h2 className="men-cat-title">{title}</h2> : null}

      <div className="u-type-circles-row-small men-circles-row-like-women">
        {categories.map((c) => {
          const isActive = activeCategory === c.key;

          return (
            <button
              key={c.key}
              type="button"
              className={`u-type-style-circle ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange && onCategoryChange(c.key)}
            >
              <div className="u-type-img-circle-small">
                <img src={c.image} alt={c.label} />
              </div>
              <p className="u-type-label-small">{c.label}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
