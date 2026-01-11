import React from 'react';
import colorCards from '../data/ColorCardsData';
import ColorCard from './ColorCard';
import './ColorCollection.css';

export default function ColorCollection() {
  return (
    <section className="color-section">
      <h2 className="color-title">Shop By Color</h2>

      <div className="color-grid">
        {colorCards.map((item) => (
          <ColorCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
