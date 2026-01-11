// src/components/women/WomenTypeHeader.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pages/WomenPage.css';

export default function WomenTypeHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  const isUnstitched = path === '/unstitched';
  const isRTW = path === '/ready-to-wear';
  const isAccessories = path === '/accessories';
  const isWomenRoot = path === '/women';

  const cards = [
    {
      key: 'unstitched',
      label: 'UNSTITCHED',
      img: '/images/winter.jfif',
      link: '/unstitched',
      active: isUnstitched,
    },
    {
      key: 'ready',
      label: 'READY TO WEAR',
      img: '/images/cords1.jfif',
      link: '/ready-to-wear',
      active: isRTW,
    },
    {
      key: 'accessories',
      label: 'ACCESSORIES',
      img: '/images/jewl.jfif',
      link: '/accessories',
      active: isAccessories,
    },
  ];

  return (
    <section className="women-root-type-header">
      <div className="women-root-circles">
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`women-root-circle ${
              c.active || isWomenRoot ? '' : ''
            } ${c.active ? 'active' : ''}`}
            onClick={() => navigate(c.link)}
          >
            <div className="women-root-img">
              <img src={c.img} alt={c.label} />
            </div>
            <p className="women-root-label">{c.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
