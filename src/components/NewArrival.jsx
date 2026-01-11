import React, { useMemo } from 'react';
import './NewArrival.css'; // you can keep if it has section padding etc
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';

import './SharedCard.css'; // ✅ important (or import it globally once)

export default function NewArrivals() {
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();
  const { products = [], loading } = useProducts();

  const newProducts = useMemo(() => {
    const list = (products || []).filter(
      (p) => p?.isNew === true || String(p?.tag || '').toLowerCase() === 'new'
    );

    const sorted = list.sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return Number(b?.popularity || 0) - Number(a?.popularity || 0);
    });

    return sorted.slice(0, 8);
  }, [products]);

  function handleWishlist(e, item) {
    e.preventDefault();
    e.stopPropagation();

    addToWishlist({
      id: item.id,
      name: item.title || item.name || 'Product',
      title: item.title || item.name || 'Product',
      brand: item.brand || '',
      image: item.image || item.images?.[0] || '',
      price: Number(item.price || 0),
      salePercent: Number(item.salePercent || 0),
      originalPrice: Number(item.originalPrice || item.price || 0),
      inStock: item.inStock !== false,
      size: item.size || null,
    });
  }

  return (
    <section className="new-arrivals">
      <div className="new-arrivals-head">
        <h2 className="new-arrivals-title">New Arrivals</h2>
      </div>

      {loading ? (
        <p className="new-arrivals-loading">Loading new arrivals...</p>
      ) : newProducts.length === 0 ? (
        <div className="new-arrivals-empty">
          <p>No new arrivals yet.</p>
          <button
            className="new-arrivals-empty-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {newProducts.map((item) => {
            const coverImg = item.image || item.images?.[0] || '';
            const title = item.title || item.name || 'Product';

            return (
              <Link
                to={`/product/${item.id}`}
                key={`${item.id}-${item.size || ''}`}
                className="shared-card"
              >
                <div className="shared-card-image">
                  <img src={coverImg} alt={title} />

                  <button
                    className="shared-wishlist-btn"
                    onClick={(e) => handleWishlist(e, item)}
                    aria-label="Add to wishlist"
                    title="Add to wishlist"
                  >
                    <Heart size={20} />
                  </button>
                </div>

                <div className="shared-card-info">
                  <p className="shared-brand">{item.brand || ''}</p>
                  <p className="shared-name">{title}</p>

                  <p className="shared-price">
                    PKR {Number(item.price || 0).toLocaleString()}
                    {Number(item.originalPrice || 0) >
                    Number(item.price || 0) ? (
                      <span className="shared-old-price">
                        PKR {Number(item.originalPrice || 0).toLocaleString()}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
