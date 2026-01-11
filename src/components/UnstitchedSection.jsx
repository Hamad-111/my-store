// src/components/UnstitchedSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnstitchedSection.css';

export default function UnstitchedSection() {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'WINTER',
      key: 'winter',
      image: '/images/product1.jfif',
    },
    {
      name: 'EMBROIDERED',
      key: 'embroidered',
      image: '/images/product2.jfif',
    },
    {
      name: 'PRINTED',
      key: 'printed',
      image: '/images/product3.jfif',
    },
    {
      name: 'VELVET',
      key: 'velvet',
      image: '/images/green6.jfif',
    },
  ];

  const handleClick = (cat) => {
    // Go to /women and pass the "type" in URL
    navigate(`/unstitched?type=${cat.key}`);
  };

  return (
    <section className="unstitched-section">
      <h2 className="unstitched-title">UNSTITCHED</h2>

      <div className="unstitched-grid">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className="unstitched-card"
            type="button"
            onClick={() => handleClick(cat)}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="unstitched-img"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/260x260?text=${encodeURIComponent(
                  cat.name
                )}`;
              }}
            />
            <p className="unstitched-label">{cat.name}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
