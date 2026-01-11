// src/components/HomeCategory.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeCategory.css';

export default function ReadyToWearSection() {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'EMBROIDERED',
      img: '/images/embroidary1.jfif',
      slug: 'embroidered',
    },
    { name: 'PRINTED', img: '/images/printed.jfif', slug: 'printed' },
    { name: 'SOLIDS', img: '/images/solid.jfif', slug: 'solids' },
    { name: 'CO-ORDS', img: '/images/cords1.jfif', slug: 'coords' },
    { name: 'FORMALS', img: '/images/formals.jfif', slug: 'formals' },
    { name: 'KURTIS', img: '/images/kurtis5.jfif', slug: 'kurtis' },
    { name: 'BOTTOMS', img: '/images/womenbottom5.jfif', slug: 'bottoms' },
  ];

  // 👉 This MUST exist inside the component
  const handleClick = (slug) => {
    navigate(`/ready-to-wear?type=${slug}`);
  };

  return (
    <div className="rtw-section">
      <h2 className="rtw-title">READY TO WEAR</h2>

      <div className="rtw-grid">
        {categories.map((cat, index) => (
          <button
            key={index}
            type="button"
            className="rtw-card"
            onClick={() => handleClick(cat.slug)} // 👈 No error now
          >
            <div className="rtw-img-wrapper">
              <img src={cat.img} alt={cat.name} className="rtw-img" />
            </div>
            <p className="rtw-name">{cat.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
