import React from 'react';
import '../../pages/WomenPage.css';

export default function CategoryCircles({ onClick }) {
  const categories = [
    {
      name: 'UNSTITCHED',
      img: '/images/best6.jfif',
    },
    {
      name: 'READY TO WEAR',
      img: '/images/best1.jfif',
    },
    {
      name: 'WESTERN',
      img: '/images/Coords.jfif',
    },
    {
      name: 'ACCESSORIES',
      img: '/images/jewl.jfif',
    },
  ];

  return (
    <div className="wcircle-container">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="wcircle-item"
          onClick={() => onClick(cat.name)}
        >
          <img src={cat.img} alt={cat.name} className="wcircle-img" />
          <p className="wcircle-label">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}
