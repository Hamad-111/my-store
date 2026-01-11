// src/components/women/Banner.jsx
import React from 'react';
import '../../pages/WomenPage.css';

export default function Banner({ currentTag }) {
  const lowerTag = (currentTag || '').toLowerCase();

  const bannerByTag = {
    // 🔹 Yahan object rakha hua hai
    'women-root': {
      image: '/images/womenbanner2.PNG',
      title: 'WOMEN',
      subtitle: 'Unstitched • Ready to Wear • Accessories',
    },

    // 🔹 Neeche sab sirf string paths hain
    unstitched: '/images/wb1.png',
    winter: '/images/winterrr (1).png',
    printed: '/images/womenbanner9.PNG',
    embroidered: '/images/embcat.PNG',
    velvet: '/images/wb22.png',
    'women-main': '/images/womenbanner9.PNG',

    'winter-printed': '/images/womenbanner8.PNG',
    'winter-embroidered': '/images/womenbanner7.PNG',
    'printed-printed': '/images/wb3.png',
    'printed-embroidered': '/images/wb4.png',
    'embroidered-embroidered': '/images/wb7.PNG',
    'velvet-embroidered': '/images/wb6.png',

    // ==== READY-TO-WEAR tags (agar baad me use karo) ====
    'rtw-embroidered': '/images/wb11.PNG',
    'rtw-printed': '/images/wb9.PNG',
    'rtw-solids': '/images/wb5.png',
    'rtw-coords': '/images/wb12.PNG',
    'rtw-formals': '/images/wb4.png',
    'rtw-kurtis': '/images/wb3.png',
    'rtw-bottoms': '/images/wb10.PNG',
    'rtw-default': '/images/womenbanner.png',
  };

  const entry = bannerByTag[lowerTag];
  const fallback = '/images/womenbanner.png';

  // ✅ Agar string hai to direct use karo, agar object hai to .image lo
  const src =
    typeof entry === 'string'
      ? entry
      : entry && entry.image
      ? entry.image
      : fallback;

  return (
    <div className="women-banner">
      <img src={src} alt="Women banner" className="women-banner-img" />
    </div>
  );
}
