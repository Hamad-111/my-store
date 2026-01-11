import React from 'react';
import './Banner.css';

export default function Banner() {
  return (
    <section className="promo-banner">
      <div className="banner-content">
        <div className="banner-left">
          {/* 👇 Replace image path with your own */}
          <img
            src="/images/banner.png"
            alt="Affordable & Adorable"
            className="banner-image"
          />
        </div>

        <div className="banner-right">
          <h2>
            <span className="highlight">AFFORDABLE & ADORABLE</span>
          </h2>
          <h1>
            CHIC FITS <span className="bold-7k">UNDER 7K</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
