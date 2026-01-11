import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProducts } from '../context/ProductContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './WomenPage.css';
import '../components/SharedCard.css';

export default function BestSellersPage() {
  const { products = [], loading } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const bestSellers = useMemo(() => {
    return products.filter((p) => p.isBestSeller === true);
  }, [products]);

  const handleWishlistClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const already = isInWishlist(item.id);
    if (already) removeFromWishlist(item.id);
    else {
      addToWishlist({
        id: item.id,
        name: item.name || item.title,
        brand: item.brand,
        image: item.image,
        price: item.price,
        tag: item.tag || 'Best Seller',
        source: 'best-seller',
      });
    }
  };

  if (loading) {
    return (
      <div
        className="women-page"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <h2>Loading best sellers...</h2>
      </div>
    );
  }

  return (
    <div className="women-page" style={{ marginTop: 70 }}>
      <div style={{ padding: '20px 6%' }}>
        <h2 style={{ marginBottom: 6 }}>Best Sellers</h2>
        <p style={{ color: '#666', marginTop: 0 }}></p>

        {bestSellers.length === 0 && (
          <div className="no-results">No Result Found</div>
        )}

        <div className="products-grid products-grid-four">
          {bestSellers.map((item) => {
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
                    className={`shared-wishlist-btn ${inWish ? 'active' : ''}`}
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
        </div>
      </div>
    </div>
  );
}
