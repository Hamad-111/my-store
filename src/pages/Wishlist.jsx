import React, { useEffect } from 'react';
import './Wishlist.css';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { wishlist = [], removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ✅ your AuthContext provides `loading`
  const { user, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return;
    if (!user) navigate('/login', { state: { pulse: true }, replace: true });
  }, [user, authReady, navigate]);

  if (!authReady) return null;
  if (!user) return null;

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
      size: item.size || null,
    });
    navigate('/cart');
  };

  // ❌ REMOVE THIS (this was causing the error)
  // if (!isLoggedIn) return null;

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
