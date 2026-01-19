// ✅ src/components/accessories/AccessoryProductCard.jsx (UPDATED: stockQuantity + inStock passed)
// - guest snapshot now includes stockQuantity + inStock
// - logged-in addToCart payload includes stockQuantity + inStock
// - wishlist payload includes stockQuantity (optional) + inStock

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { pushPendingAction } from '../../utils/pendingActions';

import '../SharedCard.css';

export default function AccessoryProductCard({ product }) {
  const navigate = useNavigate();

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
    try {
      const existing = sessionStorage.getItem('vv_trail');
      if (!existing) {
        const fallback = [
          { label: 'Home', to: '/' },
          { label: 'Women', to: '/women' },
          { label: 'Accessories', to: '/accessories' },
        ];
        sessionStorage.setItem('vv_trail', JSON.stringify(fallback));
      }
    } catch {}

    navigate(`/product/${product.id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();

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

    addToWishlist({
      id: product.id,
      name: title,
      title,
      brand: product.brand || '',
      image: coverImg,
      price: Number(product.price || 0),
      salePercent: Number(product.salePercent || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
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

  const tagText = (product?.tag || product?.mainCategory || 'accessories')
    .toString()
    .toLowerCase();

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

        {isOut ? <div className="acc-oos-badge">Out of Stock</div> : null}

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
        <p className="shared-tag">{tagText}</p>

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
