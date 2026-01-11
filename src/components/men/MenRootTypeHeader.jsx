import React from 'react';
import '../../pages/MenPage.css';

export default function MenRootTypeHeader({ onPick }) {
  const rootTypes = [
    { key: 'menswear', label: 'MENSWEAR', image: '/images/menkurti2.jfif' },
  ];

  return (
    <section className="u-type-wrapper u-type-wrapper-small men-root-header">
      <div className="u-type-circles-row-small men-root-circles">
        {rootTypes.map((t) => (
          <button
            key={t.key}
            type="button"
            className="u-type-style-circle"
            onClick={() => onPick && onPick(t.key)}
          >
            <div className="u-type-img-circle-small">
              <img src={t.image} alt={t.label} />
            </div>
            <p className="u-type-label-small">{t.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
