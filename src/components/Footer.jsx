import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand + Contact */}
        <div className="footer-section">
          <h1 className="footer-logo">Vestivistora</h1>

          <p>
            Email:{' '}
            <a href="mailto:care@vestivistora.com">farihashah2812@gmail.com</a>
          </p>

          <p>Call: 03318151484 </p>

          <div className="social-icons">
            <a href="#" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#" aria-label="YouTube">
              <Youtube />
            </a>
          </div>
        </div>

        {/* Useful Links */}
        <div className="footer-section">
          <h2>Useful Links</h2>
          <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/Career">Career</Link>
            </li>
            <li>
              <Link to="/brand">Brands</Link>
            </li>
          </ul>
        </div>

        {/* Customer Policies */}
        <div className="footer-section">
          <h2>Customer Policies</h2>
          <ul>
            <li>
              <Link to="/complaints">Complaints</Link>
            </li>
            <li>
              <Link to="/terms">Terms & Conditions</Link>
            </li>
            <li>
              <Link to="/PrivacyPolicy">Privacy & Policy</Link>
            </li>
            <li>
              <Link to="/feedback">Feedbacks</Link>
            </li>
          </ul>
        </div>

        {/* Help Center */}
        <div className="footer-section">
          <h2>Help Center</h2>
          <ul>
            <li>
              <Link to="/track-order">Track Your Order</Link>
            </li>
            <li>
              <Link to="/exchange-policy">Exchange Policy</Link>
            </li>
            <li>
              <Link to="/FAQs">FAQs</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="footer-bottom">© 2025 Vestivistora Store</p>
    </footer>
  );
}
