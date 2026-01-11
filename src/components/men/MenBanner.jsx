// src/components/men/MenBanner.jsx
import React from 'react';
import '../../pages/MenPage.css';

export default function MenBanner({ currentTag }) {
  const banners = {
    // ✅ category banners
    'men-menswear-kurta': { img: '/images/kurtaa.png' },
    'men-menswear-shalwar-kameez': { img: '/images/kameez.PNG' },
    'men-menswear-shirts': { img: '/images/t-shirt.png' },

    // ✅ section banner (menswear)
    'men-menswear': { img: '/images/menswear.PNG' },

    // ✅ men landing banner
    'men-root': { img: '/images/menswear.PNG' }, // put your MEN banner image here
  };

  const data = banners[currentTag] || banners['men-menswear'];

  return (
    <div
      className="men-banner"
      style={{
        backgroundImage: `url(${data?.img || '/images/menswear.PNG'})`,
      }}
    />
  );
}
