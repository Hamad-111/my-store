// src/components/women/WesternTypeHeader.jsx
import React from 'react';
import '../../pages/WomenPage.css';

export default function WesternTypeHeader({ activeType, onTypeChange }) {
  const options = [
    { key: 'TOPS', label: 'TOPS', img: '/images/western-tops.jpg' },
    { key: 'CO-ORDS', label: 'CO-ORDS', img: '/images/western-coords.jpg' },
    { key: 'DRESSES', label: 'DRESSES', img: '/images/western-dresses.jpg' },
    { key: 'SWEATERS', label: 'SWEATERS', img: '/images/western-sweaters.jpg' },
    { key: 'JACKETS', label: 'JACKETS', img: '/images/western-jackets.jpg' },
    {
      key: 'CARDIGANS',
      label: 'CARDIGANS',
      img: '/images/western-cardigans.jpg',
    },
    { key: 'CAPE', label: 'CAPE', img: '/images/western-cape.jpg' },
    { key: 'SHAWLS', label: 'SHAWLS', img: '/images/western-shawls.jpg' },
  ];

  return (
    <section className="u-type-wrapper u-type-wrapper-small">
      <h2 className="u-type-title u-type-title-small">WESTERN</h2>

      <div className="u-type-circles-row u-type-circles-row-small">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`u-type-style-circle ${
              activeType === opt.key ? 'active' : ''
            }`}
            onClick={() => onTypeChange && onTypeChange(opt.key)}
          >
            <div className="u-type-img-circle-small">
              <img src={opt.img} alt={opt.label} />
            </div>
            <p className="u-type-label-small">{opt.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
