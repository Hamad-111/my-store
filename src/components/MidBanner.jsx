import React from 'react';
import './MidBanner.css';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <h2 className="hero-subtitle">ALKARAM</h2>
        <h1 className="hero-title">LUXE</h1>
        <p className="hero-winter">UNSTITCHED WINTER’25</p>

        <button className="hero-btn" onClick={() => navigate('/unstitched')}>
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default Banner;
