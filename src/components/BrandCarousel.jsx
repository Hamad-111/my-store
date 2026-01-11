// src/components/BrandCarousel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandCarousel.css';

import { useProducts } from '../context/ProductContext';

export default function BrandCarousel() {
  const navigate = useNavigate();
  const { brands } = useProducts();

  const localBrands = [
    { logo: '/images/khaddii.png', name: 'Khaadi' },
    { logo: '/images/alkaram studio.png', name: 'Alkaram' },
    { logo: '/images/nishat line.png', name: 'Nishat' },
    { logo: '/images/satrangi.png', name: 'Satrangi' },
    { logo: '/images/sapphire.png', name: 'Sapphire' },
    { logo: '/images/j.png', name: 'J.' },
  ];

  const displayBrands = brands && brands.length > 0 ? brands : localBrands;

  const scrollingBrands = [...displayBrands, ...displayBrands];

  const handleBrandClick = (brandName) => {
    navigate(`/women?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <section className="brand-carousel-section">
      <div className="brand-carousel-wrapper">
        <div className="brand-carousel">
          {scrollingBrands.map((brand, index) => (
            <div
              className="brand-item"
              key={index}
              onClick={() => handleBrandClick(brand.name)}
              style={{ cursor: 'pointer' }}
            >
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
