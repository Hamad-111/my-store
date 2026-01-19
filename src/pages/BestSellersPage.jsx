import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useProducts } from '../context/ProductContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './WomenPage.css';
import '../components/SharedCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pushPendingAction } from '../utils/pendingActions';

const getFromLabel = (pathname = '') => {
  if (pathname === '/best-sellers') return 'Best Sellers';
  if (pathname === '/women') return 'Women';
  if (pathname === '/unstitched') return 'Unstitched';
  if (pathname === '/ready-to-wear') return 'Ready To Wear';
  if (pathname === '/accessories') return 'Accessories';
  if (pathname === '/men') return 'Men';
  return 'Shop';
};

export default function BestSellersPage() {
  const { products = [], loading } = useProducts();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const bestSellers = useMemo(() => {
    return (products || []).filter((p) => p.isBestSeller === true);
  }, [products]);

  const openDetail = (item) => {
    const from = {
      pathname: location.pathname,
      search: location.search,
      label: getFromLabel(location.pathname),
    };

    try {
      sessionStorage.setItem('vv_last_from', JSON.stringify(from));
    } catch {}

    navigate(`/product/${item.id}`, { state: { from } });
  };

  const handleWishlistClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const snapshot = {
        id: String(item.id),
        title: item.title || item.name || 'Product',
        name: item.title || item.name || 'Product',
        brand: item.brand || '',
        image: item.image || item.images?.[0] || '',
        price: Number(item.price || 0),
        salePercent: Number(item.salePercent || 0),
        originalPrice: Number(item.originalPrice || item.price || 0),
        size: item.size || null,
      };

      pushPendingAction({
        type: 'ADD_TO_WISHLIST',
        productId: String(item.id),
        size: snapshot.size || null,
        redirectBack: '/wishlist',
        snapshot,
      });

      navigate('/login', { state: { pulse: true } });

      const already = isInWishlist(item.id);
      if (already) removeFromWishlist(item.id);
      else {
        addToWishlist({
          id: item.id,
          name: item.title || item.name,
          title: item.title || item.name,
          brand: item.brand || '',
          image: item.image || item.images?.[0] || '',
          price: Number(item.price || 0),
          salePercent: Number(item.salePercent || 0),
          originalPrice: Number(item.originalPrice || item.price || 0),
          size: item.size || null,
        });

        navigate('/wishlist');
      }
    }

    // ✅ Logged in => toggle
    const already = isInWishlist(item.id);
    if (already) {
      removeFromWishlist(item.id);
      return;
    }

    addToWishlist({
      id: item.id,
      name: title,
      title,
      brand: item.brand || '',
      image: coverImg,
      price: Number(item.price || 0),
      salePercent: Number(item.salePercent || 0),
      originalPrice: Number(item.originalPrice || item.price || 0),
      tag: item.tag || 'Best Seller',
      size: item.size || null,
    });

    navigate('/wishlist');
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

        {bestSellers.length === 0 && (
          <div className="no-results">No Result Found</div>
        )}

        <div className="products-grid products-grid-four">
          {bestSellers.map((item) => {
            const inWish = isInWishlist(item.id);
            const title = item.name || item.title || 'Product';
            const coverImg =
              item.image ||
              (Array.isArray(item.images) ? item.images[0] : '') ||
              '';

            return (
              <div
                key={item.id}
                className="shared-card"
                role="button"
                tabIndex={0}
                onClick={() => openDetail(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') openDetail(item);
                  if (e.key === ' ') {
                    e.preventDefault();
                    openDetail(item);
                  }
                }}
              >
                <div className="shared-card-image">
                  <img src={coverImg} alt={title} />

                  <button
                    type="button"
                    className={`shared-wishlist-btn ${inWish ? 'active' : ''}`}
                    onClick={(e) => handleWishlistClick(e, item)}
                    aria-label="Add to wishlist"
                    title="Add to wishlist"
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
                  <p className="shared-name">{title}</p>
                  <p className="shared-price">
                    PKR {Number(item.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
