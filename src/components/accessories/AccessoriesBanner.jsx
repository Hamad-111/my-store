// src/components/accessories/AccessoriesBanner.jsx
import React from 'react';
import '../../pages/WomenPage.css';

export default function AccessoriesBanner({ currentTag }) {
  // ✅ normalize: lowercase + space → hyphen
  const normalizedTag = (currentTag || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

  const bannerByTag = {
    accessories: '/images/funn.png',
    jewellery: '/images/jewlbanner.PNG',
    shawls: '/images/shawlss.PNG',
    'hair-accessories': '/images/hairrrr.PNG',
    hair: '/images/hairrrr.PNG',
  };

  const src = bannerByTag[normalizedTag] || bannerByTag.accessories;

  return (
    <div className="women-banner">
      <img src={src} alt="Accessories banner" className="women-banner-img" />
    </div>
  );
}
