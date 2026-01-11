// src/pages/Wishlist.jsx
import React, { useEffect } from 'react';
import './Wishlist.css';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, isLoggedIn } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ block wishlist for guest
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signup');
    }
  }, [isLoggedIn, navigate]);

  // Hide footer only on wishlist page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    return () => {
      if (footer) footer.style.display = 'block';
    };
  }, []);

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      image: item.image,
      price: item.price,
      salePercent: item.salePercent || 0,
      originalPrice: item.originalPrice || item.price,
      qty: 1,
    });
    navigate('/cart');
  };

  // ✅ while redirecting (avoid flicker)
  if (!isLoggedIn) return null;

  // Empty
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-content">
          <h2 className="wishlist-title">My Wishlist</h2>

          <div className="empty-wishlist">
            <div className="empty-icon">
              <div className="icon-circle">♡</div>
            </div>
            <h3>No products found</h3>
            <p>
              Your wishlist is empty. Explore trending items and save your
              favorites!
            </p>
            <button className="explore-btn" onClick={() => navigate('/women')}>
              Explore Trending Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Has items
  return (
    <div className="wishlist-page">
      <div className="wishlist-content">
        <h2 className="wishlist-title">My Wishlist</h2>

        <div className="wishlist-items">
          {wishlist.map((item) => (
            <div
              className="wishlist-card"
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <img src={item.image} alt={item.name} className="wishlist-img" />

              <h4 className="wishlist-name">{item.name}</h4>

              {item.brand && (
                <p className="wishlist-brand">Brand: {item.brand}</p>
              )}

              <p className="wishlist-price">
                PKR {Number(item.price || 0).toLocaleString()}
              </p>

              <button
                className="wishlist-add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item);
                }}
              >
                Add to Cart
              </button>

              <button
                className="wishlist-delete-btn"
                title="Remove from wishlist"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(item.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
