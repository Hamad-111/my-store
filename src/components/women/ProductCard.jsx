// ✅ src/components/women/ProductCard.jsx (UPDATED: stockQuantity + inStock passed)
// - guest snapshot now includes stockQuantity + inStock
// - logged-in addToCart payload includes stockQuantity + inStock
// - wishlist payload also includes stockQuantity (optional) + inStock (already)

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { pushPendingAction } from '../../utils/pendingActions';
import { useWishlist } from '../../context/WishlistContext.jsx';

import '../SharedCard.css';

const getFromLabel = (pathname = '') => {
  if (pathname === '/women') return 'Women';
  if (pathname === '/unstitched') return 'Unstitched';
  if (pathname === '/ready-to-wear') return 'Ready To Wear';
  if (pathname === '/accessories') return 'Accessories';
  if (pathname === '/men') return 'Men';
  if (pathname === '/brands') return 'Brands';
  return 'Shop';
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { user } = useAuth();

  const coverImg = useMemo(() => {
    return (
      product?.image ||
      (Array.isArray(product?.images) && product.images.length > 0
        ? product.images[0]
        : '')
    );
  }, [product]);

  const title = product?.title || product?.name || 'Product';

  // ✅ stock helpers
  const stockQty = Math.max(0, Number(product?.stockQuantity || 0));
  const isOut = product?.inStock === false || stockQty <= 0;

  const hasSale = !isOut && Number(product?.salePercent || 0) > 0;

  const openDetail = () => {
    const from = {
      pathname: location.pathname,
      search: location.search,
      label: getFromLabel(location.pathname),
    };

    try {
      sessionStorage.setItem('vv_last_from', JSON.stringify(from));
    } catch {}

    navigate(`/product/${product.id}`, { state: { from } });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();

    // ✅ Not logged in => pending + login
    if (!user) {
      const snapshot = {
        id: String(product.id),
        title,
        name: title,
        brand: product.brand || '',
        image: coverImg || '',
        price: Number(product.price || 0),
        salePercent: Number(product.salePercent || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        size: product.size || null,

        // ✅ NEW
        stockQuantity: stockQty,
        inStock: !isOut,
      };

      pushPendingAction({
        type: 'ADD_TO_WISHLIST',
        productId: String(product.id),
        size: snapshot.size || null,
        redirectBack: '/wishlist',
        snapshot,
      });

      navigate('/login', { state: { pulse: true } });
      return;
    }

    // ✅ Logged in => wishlist
    addToWishlist({
      id: product.id,
      name: title,
      title,
      brand: product.brand || '',
      image: coverImg,
      price: Number(product.price || 0),
      salePercent: Number(product.salePercent || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),

      // ✅ keep
      inStock: !isOut,
      size: product.size || null,

      // ✅ optional but helpful
      stockQuantity: stockQty,
    });

    navigate('/wishlist');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (isOut) return;

    // ✅ Not logged in => pending + login
    if (!user) {
      const snapshot = {
        id: String(product.id),
        title,
        name: title,
        brand: product.brand || '',
        image: coverImg || '',
        price: Number(product.price || 0),
        salePercent: Number(product.salePercent || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        size: product.size || null,

        // ✅ NEW
        stockQuantity: stockQty,
        inStock: !isOut,
      };

      pushPendingAction({
        type: 'ADD_TO_CART',
        productId: String(product.id),
        qty: 1,
        size: snapshot.size || null,
        redirectBack: '/cart',
        snapshot,
      });

      navigate('/login', { state: { pulse: true } });
      return;
    }

    // ✅ Logged in => cart
    addToCart({
      id: product.id,
      name: title,
      brand: product.brand || '',
      image: coverImg,
      price: Number(product.price || 0),
      salePercent: Number(product.salePercent || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      qty: 1,
      size: product.size || null,

      // ✅ NEW (CartContext cap relies on this)
      stockQuantity: stockQty,
      inStock: !isOut,
    });

    navigate('/cart');
  };

  return (
    <div
      className={`shared-card ${isOut ? 'is-out' : ''}`}
      onClick={openDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openDetail();
        if (e.key === ' ') {
          e.preventDefault();
          openDetail();
        }
      }}
    >
      <div className="shared-card-image">
        <img src={coverImg} alt={title} />

        {hasSale ? (
          <span className="sale-badge">{Number(product.salePercent)}% OFF</span>
        ) : null}

        {isOut ? <div className="women-oos-badge">Out of Stock</div> : null}

        <button
          type="button"
          className="shared-wishlist-btn"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          title="Add to wishlist"
        >
          <Heart size={20} />
        </button>

        <button
          type="button"
          className="shared-cart-btn"
          onClick={handleAddToCart}
          title={isOut ? 'Out of Stock' : 'Add to cart'}
          aria-label={isOut ? 'Out of Stock' : 'Add to cart'}
          disabled={isOut}
          aria-disabled={isOut}
        >
          <img src="/images/shop.png" alt="Add to cart" />
        </button>
      </div>

      <div className="shared-card-info">
        {product?.tag ? <p className="shared-tag">{product.tag}</p> : null}

        <p className="shared-brand">{product?.brand || ''}</p>
        <p className="shared-name">{title}</p>

        <p className="shared-price">
          PKR {Number(product?.price || 0).toLocaleString()}
          {Number(product?.originalPrice || 0) > Number(product?.price || 0) ? (
            <span className="shared-old-price">
              PKR {Number(product.originalPrice || 0).toLocaleString()}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
