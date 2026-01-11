import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Blog.css';
import Footer from '../components/Footer';

export default function BlogDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const blog = location.state?.blog;

  if (!blog) {
    return (
      <div className="not-found">
        <h2>Blog not found</h2>
        <button className="back-btn" onClick={() => navigate('/blog')}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="blog-detail-page">
        <div className="detail-grid">
          {/* LEFT SIDE - Blog Content */}
          <div className="detail-container">
            {/* ✅ Title First */}
            <div className="detail-content">
              <h1 className="detail-title">{blog.title}</h1>
            </div>

            {/* ✅ Then Image */}
            <img src={blog.image} alt={blog.title} className="detail-image" />

            {/* ✅ Then Full Text */}
            <div className="detail-content">
              <p className="full-text">{blog.fullContent}</p>
            </div>
          </div>

          {/* RIGHT SIDE - Ads Section */}
          <div className="ads-section">
            <h3 className="ads-title">Sponsored</h3>

            <div className="ad-box">
              <img src="/images/printed5.jfif" alt="Ad 1" />
              <p>Shop the latest winter collection now!</p>
            </div>

            <div className="ad-box">
              <img src="/images/hair.jfif" alt="Ad 2" />
              <p>Get 20% off on all fashion accessories.</p>
            </div>

            <div className="ad-box">
              <img src="/images/vision.jfif" alt="Ad 3" />
              <p>Exclusive offers from top Pakistani brands.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
