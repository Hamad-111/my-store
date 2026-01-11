import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessoriesSection.css';

const data = [
  { img: '/images/story.jfif', label: 'JEWELLRY', slug: 'jewellery' },

  { img: '/images/womenshawl1.jfif', label: 'SHAWLS', slug: 'shawls' },
  {
    img: '/images/hair.jfif',
    label: 'HAIR ACCESSORIES',
    slug: 'hair-accessories',
  },
];

export default function AccessoriesSection() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handleClickCategory = (slug) => {
    navigate(`/accessories?cat=${slug}`);
  };

  return (
    <div className="acc-container">
      <div className="acc-header">
        <h2>ACCESSORIES</h2>
      </div>

      <div className="acc-list" ref={scrollRef}>
        {data.map((item, i) => (
          <button
            key={i}
            type="button"
            className="acc-item"
            onClick={() => handleClickCategory(item.slug)}
          >
            <div className="acc-circle">
              <img src={item.img} alt={item.label} />
            </div>
            <p>{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
