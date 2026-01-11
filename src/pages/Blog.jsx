import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';
import Footer from '../components/Footer.jsx'; // 👈 adjust the path if needed

export default function Blog() {
  const navigate = useNavigate();

  const blogs = [
    {
      id: 1,
      title: 'Winter Fashion Trends 2025',
      description:
        'Discover the latest winter styles in Pakistan — cozy fabrics, earthy tones, and timeless designs that redefine comfort and elegance.',
      fullContent:
        'This season, Pakistani fashion embraces layered textures — from soft khaddar to luxurious velvet shawls. Earthy hues like sand beige, olive green, and chestnut brown dominate the palette. Pair oversized coats with knee-high boots and minimal jewelry for a modern yet traditional vibe.',
      image: '/images/printed.jfif',
    },
    {
      id: 2,
      title: 'Top 5 Pakistani Brands You’ll Love',
      description:
        'From Sapphire to Khaadi — explore the top brands that bring you authentic Pakistani fashion with a modern twist.',
      fullContent:
        'These brands not only represent style but also quality. Khaadi continues to lead with handcrafted designs, while Limelight introduces budget-friendly chic wear. Nishat Linen’s versatility and Gul Ahmed’s timeless classics ensure there’s something for everyone.',
      image: '/images/printed2.jfif',
    },
    {
      id: 3,
      title: 'Styling Tips for Every Occasion',
      description:
        'Whether it’s Eid, a wedding, or a casual hangout — find styling inspiration that fits every moment beautifully.',
      fullContent:
        'For festive events, try statement jewelry and embroidered dupattas. For everyday wear, go for soft lawn suits or pastel kurtas with straight trousers. Confidence and comfort are the keys — mix and match prints with minimal accessories for that effortless charm.',
      image: '/images/printed4.jfif',
    },
  ];

  const handleReadMore = (id) => {
    navigate(`/blog/${id}`, {
      state: { blog: blogs.find((b) => b.id === id) },
    });
  };

  return (
    <>
      <section className="blog-section">
        <div className="blog-container">
          <h1 className="blog-title">Latest from Our Blog</h1>

          <div className="blog-grid">
            {blogs.map((blog) => (
              <div
                className="blog-card"
                key={blog.id}
                onClick={() => handleReadMore(blog.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* IMAGE AREA — includes "Read More" now */}
                <div className="blog-image-container">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="blog-image"
                  />
                  <button
                    className="read-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReadMore(blog.id);
                    }}
                  >
                    Read More
                  </button>
                </div>

                {/* TEXT AREA */}
                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  <p>{blog.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
