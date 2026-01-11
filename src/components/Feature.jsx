import React from 'react';
import './Feature.css';
import {
  FiThumbsUp,
  FiTruck,
  FiShoppingBag,
  FiAward,
  FiRefreshCcw,
} from 'react-icons/fi'; // Outline icons from Feather Icons

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-header">
        <h2>OUR PROGRAMS</h2>
        <p>Things you find at VestiVistora</p>
      </div>

      <div className="features-container">
        <div className="feature-card">
          <FiThumbsUp className="feature-icon" />
          <h3>Secure Payment</h3>
          <p>Cash On Delivery</p>
        </div>

        <div className="feature-card">
          <FiTruck className="feature-icon" />
          <h3>We Ship</h3>
          <p>Only In Pakistan</p>
        </div>

        <div className="feature-card">
          <FiShoppingBag className="feature-icon" />
          <h3>We Stock</h3>
          <p>Original Brands</p>
        </div>

        <div className="feature-card">
          <FiAward className="feature-icon" />
          <h3>Comapre</h3>
          <p>Compare Products From Different Brands</p>
        </div>

        <div className="feature-card">
          <FiRefreshCcw className="feature-icon" />
          <h3>Easy Exchange</h3>
          <p>Available</p>
        </div>
      </div>
    </section>
  );
}
