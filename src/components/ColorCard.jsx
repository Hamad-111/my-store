import React from 'react';
import { Link } from 'react-router-dom';
import './ColorCard.css';

export default function ColorCard({ item }) {
  return (
    <Link to={`/color/${item.id}`} className="color-box">
      <div className="color-box-image">
        <img src={item.image} alt={item.title} />
      </div>

      <p className="color-box-title">{item.title}</p>
    </Link>
  );
}
