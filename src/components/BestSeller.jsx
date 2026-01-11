// src/components/BestSeller.jsx
import React, { useMemo } from 'react';
import './BestSeller.css';
import './SharedCard.css';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useProducts } from '../context/ProductContext';

export default function BestSeller() {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { products = [] } = useProducts();

  // ✅ All best sellers from merged products
  const bestSellers = useMemo(() => {
    return products.filter((p) => p.isBestSeller === true);
  }, [products]);

  // ✅ Show limited items on home (e.g., 6)
  const displayProducts = bestSellers.slice(0, 3);

  const handleWishlistClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const already = isInWishlist(item.id);
    if (already) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        name: item.name || item.title, // ✅ support both
        brand: item.brand,
        image: item.image,
        price: item.price,
        tag: item.tag || 'Best Seller',
        source: 'best-seller',
      });
    }
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    navigate('/best-sellers'); // ✅ new page
  };

  return (
    <section className="bs-section">
      <div className="bs-wrapper">
        {/* LEFT BANNER */}
        <div className="bs-banner">
          <span className="bs-banner-text"></span>
        </div>

        {/* RIGHT CONTENT */}
        <div className="bs-content">
          <div className="bs-header">
            <h2 className="bs-title">Best Seller</h2>
            <button className="bs-small-btn" onClick={handleViewAll}>
              View All
            </button>
          </div>

          <p className="bs-desc">
            We bring you our most loved best-selling products.
          </p>

          {/* ✅ NO SCROLL: simple grid */}
          <div className="bs-grid bordered-box">
            {displayProducts.map((item) => {
              const inWish = isInWishlist(item.id);

              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="shared-card"
                >
                  <div className="shared-card-image">
                    <img src={item.image} alt={item.name || item.title} />

                    <button
                      className={`shared-wishlist-btn ${
                        inWish ? 'active' : ''
                      }`}
                      onClick={(e) => handleWishlistClick(e, item)}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={18}
                        strokeWidth={1.8}
                        fill={inWish ? '#e11d48' : 'none'}
                      />
                    </button>
                  </div>

                  <div className="shared-card-info">
                    <p className="shared-tag">{item.tag || 'Best Seller'}</p>
                    <h3 className="shared-brand">{item.brand}</h3>
                    <p className="shared-name">{item.name || item.title}</p>
                    <p className="shared-price">
                      PKR {Number(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}

            {displayProducts.length === 0 && (
              <div style={{ padding: 20, color: '#666' }}>
                No best sellers found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
