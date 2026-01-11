// src/pages/WomenLandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/women/Banner';
import './WomenPage.css';

export default function WomenLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="women-page">
      {/* Women page banner */}
      <Banner currentTag="women-main" />

      {/* TOP TYPE HEADER with main categories */}
      <div className="women-type-header">
        <button
          type="button"
          className="women-type-pill"
          onClick={() => navigate('/unstitched')}
        >
          Unstitched
        </button>

        <button
          type="button"
          className="women-type-pill"
          onClick={() => navigate('/ready-to-wear')}
        >
          Ready to Wear
        </button>

        <button
          type="button"
          className="women-type-pill"
          onClick={() => navigate('/accessories')}
        >
          Accessories
        </button>
      </div>
    </div>
  );
}
