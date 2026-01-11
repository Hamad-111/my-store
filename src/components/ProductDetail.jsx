// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './ProductDetail.css';
import { Heart, Shuffle, ChevronDown, Star } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { products: allProducts = [], loading } = useProducts() || {};

  // ✅ states
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState('');
  const [localReviews, setLocalReviews] = useState([]);
  const [openSection, setOpenSection] = useState(null);

  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // ---------------- COMPLETE LOOK RULES ----------------
  const ACCESSORY_CATEGORIES = [
    'BAGS',
    'JEWELLRY',
    'FOOTWEAR',
    'SHAWLS',
    'WATCHES',
    'SUNGLASSES',
    'SCARVES',
    'HAIR ACCESSORIES',
  ];

  const WOMEN_MAIN = ['UNSTITCHED', 'READY_TO_WEAR'];

  const up = (v) =>
    String(v || '')
      .toUpperCase()
      .trim();
  const low = (v) =>
    String(v || '')
      .toLowerCase()
      .trim();

  const isAccessory = (p) => ACCESSORY_CATEGORIES.includes(up(p?.mainCategory));
  const isShawl = (p) => up(p?.mainCategory) === 'SHAWLS';
  const isWomenClothing = (p) => WOMEN_MAIN.includes(up(p?.mainCategory));

  const isMen = (p) => {
    const mc = up(p?.mainCategory);
    const c = up(p?.category);
    return (
      mc === 'MEN' ||
      mc === 'MENSWEAR' ||
      mc === 'MENACCESSORIES' ||
      c === 'MEN' ||
      c === 'MENSWEAR' ||
      c === 'MENACCESSORIES'
    );
  };

  // ✅ “shirt/kurti/top only” detection
  const isTopOnly = (base) => {
    const title = low(base?.title || base?.name);
    const sub = low(base?.subCategory);
    const rtwSub = low(base?.rtwSubType);
    const pieces = low(base?.pieces);

    if (pieces === '1 piece') return true;

    const topWords = ['shirt', 'kurti', 'top', 'tunic', 'blouse'];
    if (topWords.some((w) => title.includes(w))) return true;

    if (sub.includes('kurti') || rtwSub.includes('kurti')) return true;

    if (
      title.includes('co-ord') ||
      title.includes('coords') ||
      rtwSub.includes('coord')
    )
      return false;

    return false;
  };

  // ✅ bottom detection (women + men)
  const isBottom = (p) => {
    const title = low(p?.title || p?.name);
    const sub = low(p?.subCategory);
    const rtw = low(p?.rtwType);
    const rtwSub = low(p?.rtwSubType);

    const bottomWords = [
      'trouser',
      'pants',
      'bottom',
      'jeans',
      'legging',
      'shalwar',
    ];
    if (bottomWords.some((w) => title.includes(w))) return true;

    if (
      sub.includes('bottom') ||
      sub.includes('trouser') ||
      sub.includes('pants')
    )
      return true;

    if (rtw.includes('bottom') || rtwSub.includes('bottom')) return true;

    return false;
  };

  const scoreMatch = (base, cand) => {
    let s = 0;

    const bBrand = low(base?.brand);
    const cBrand = low(cand?.brand);
    if (bBrand && cBrand && bBrand === cBrand) s += 30;

    const bColor = low(base?.color);
    const cColor = low(cand?.color);
    if (bColor && cColor && bColor === cColor) s += 15;

    const bTag = low(base?.tag);
    const cTag = low(cand?.tag);
    if (bTag && cTag && bTag === cTag) s += 8;

    s += Math.min(20, Number(cand?.popularity || 0) / 5);
    return s;
  };

  const bestFromPool = (base, pool, limit) => {
    return [...pool]
      .map((p) => ({ p, s: scoreMatch(base, p) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p)
      .slice(0, limit);
  };

  const uniqueById = (list) => {
    return Array.from(new Map(list.map((x) => [String(x.id), x])).values());
  };

  // ---------------- PRODUCT FIND ----------------
  const product = useMemo(() => {
    return (allProducts || []).find((p) => String(p.id) === String(id)) || null;
  }, [allProducts, id]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [];
    const single = product.image ? [product.image] : [];
    const merged = imgs.length > 0 ? imgs : single;
    return merged.filter(Boolean);
  }, [product]);

  useEffect(() => {
    setQty(1);
    setMainImg(allImages[0] || '');
    setLocalReviews(Array.isArray(product?.reviews) ? product.reviews : []);
    setOpenSection(null);
    setSelectedSize('');
  }, [product, allImages]);

  const productName = product?.title || product?.name || 'Product';
  const productDescription =
    product?.description ||
    product?.longDescription ||
    'No description available.';

  const isReadyToWear =
    (product?.mainCategory || '').toUpperCase() === 'READY_TO_WEAR' ||
    (product?.category || '').toUpperCase() === 'READYTOWEAR';

  const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSectionToggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // ✅ rating summary
  const reviewCount = localReviews.length;

  const avgRating = useMemo(() => {
    if (!localReviews || localReviews.length === 0) return 0;
    const sum = localReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / localReviews.length;
  }, [localReviews]);

  const ratingText = useMemo(() => {
    if (reviewCount === 0) return 'No reviews yet';
    if (reviewCount === 1) return '1 Review';
    return `${reviewCount} Reviews`;
  }, [reviewCount]);

  // ✅ price logic
  const price = Number(product?.price || 0);
  const original = Number(product?.originalPrice || 0);
  const hasOriginal = original > price;

  const discountPercent = useMemo(() => {
    if (!hasOriginal || original <= 0) return 0;
    return Math.round(((original - price) / original) * 100);
  }, [hasOriginal, original, price]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert('Please enter your name and a comment.');
      return;
    }
    const r = Math.max(1, Math.min(5, Number(reviewRating || 5)));

    const newReview = {
      user: reviewName.trim(),
      rating: r,
      comment: reviewComment.trim(),
    };

    setLocalReviews((prev) => [newReview, ...(prev || [])]);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

  // ✅ related products (same brand OR same category)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return (allProducts || [])
      .filter(
        (p) =>
          String(p.id) !== String(product.id) &&
          (p.brand === product.brand ||
            (p.category && product.category && p.category === product.category))
      )
      .slice(0, 4);
  }, [allProducts, product]);

  // ✅ COMPLETE THE LOOK (NEW SMART LOGIC)
  const completeTheLook = useMemo(() => {
    if (!product) return [];

    const all = allProducts || [];
    const others = all.filter((p) => String(p.id) !== String(product.id));

    // accessory pools
    const bags = others.filter((p) => up(p?.mainCategory) === 'BAGS');
    const footwear = others.filter((p) => up(p?.mainCategory) === 'FOOTWEAR');
    const jewellery = others.filter((p) => up(p?.mainCategory) === 'JEWELLRY');
    const shawls = others.filter((p) => up(p?.mainCategory) === 'SHAWLS');
    const watches = others.filter((p) => up(p?.mainCategory) === 'WATCHES');

    // clothing pools
    const womenClothes = others.filter((p) => isWomenClothing(p));
    const menClothes = others.filter((p) => isMen(p) && !isAccessory(p));

    // A) accessories => no complete look
    // BUT shawl special case
    if (isAccessory(product)) {
      if (isShawl(product)) {
        const tops = womenClothes.filter((p) => isTopOnly(p));
        const bottoms = womenClothes.filter((p) => isBottom(p));
        const pick = uniqueById([
          ...bestFromPool(product, tops, 2),
          ...bestFromPool(product, bottoms, 2),
        ]);
        return pick.slice(0, 4);
      }
      return [];
    }

    // B) men => bottom + watch
    if (isMen(product)) {
      const bottoms = menClothes.filter((p) => isBottom(p));
      const pick = uniqueById([
        ...bestFromPool(product, bottoms, 3),
        ...bestFromPool(product, watches, 1),
      ]);
      return pick.slice(0, 4);
    }

    // C) women clothing
    const topOnly = isTopOnly(product);
    const bottoms = womenClothes.filter((p) => isBottom(p));

    let pick = [];
    if (topOnly) {
      pick = uniqueById([
        ...bestFromPool(product, bottoms, 1),
        ...bestFromPool(product, shawls, 1),
        ...bestFromPool(product, jewellery, 1),
        ...bestFromPool(product, footwear, 1),
        ...bestFromPool(product, bags, 1),
      ]);
    } else {
      pick = uniqueById([
        ...bestFromPool(product, jewellery, 1),
        ...bestFromPool(product, footwear, 1),
        ...bestFromPool(product, bags, 1),
        ...bestFromPool(product, shawls, 1),
      ]);
    }

    return pick.slice(0, 4);
  }, [allProducts, product]);

  function openComparePage() {
    if (!product) return;
    navigate('/compare', { state: { baseProduct: product } });
  }

  // ✅ AUTH CHECK
  const { user } = useAuth();

  function handleAddToCart() {
    if (!product) return;

    // ✅ Enforce Signup
    if (!user) {
      // Optional: Store current path to redirect back after login?
      // For now, simple redirect to signup
      navigate('/signup');
      return;
    }

    if (isReadyToWear && !selectedSize) {
      alert('Please select a size first.');
      return;
    }

    addToCart({
      id: product.id,
      name: productName,
      brand: product.brand,
      image: product.image || allImages[0] || '',
      price: product.price,
      salePercent: product.salePercent || 0,
      originalPrice: product.originalPrice || product.price,
      qty,
      size: isReadyToWear ? selectedSize : null,
    });

    navigate('/cart');
  }

  function handleAddToWishlist() {
    if (!product) return;

    addToWishlist({
      id: product.id,
      name: productName,
      brand: product.brand,
      image: product.image || allImages[0] || '',
      price: product.price,
      size: isReadyToWear ? selectedSize || null : null,
    });

    navigate('/wishlist');
  }

  if (loading) return <h2>Loading product...</h2>;
  if (!product) return <h2>Product not found</h2>;

  return (
    <div className="pd-page">
      <div className="pd-container">
        <div className="pd-left">
          {mainImg ? (
            <img src={mainImg} alt={productName} className="pd-main-img" />
          ) : (
            <div
              className="pd-main-img"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              No Image
            </div>
          )}

          <div className="pd-thumbs">
            {allImages.map((img, index) => (
              <img
                key={index}
                src={img}
                className={`pd-thumb ${mainImg === img ? 'active' : ''}`}
                onClick={() => setMainImg(img)}
                alt="thumb"
              />
            ))}
          </div>
        </div>

        <div className="pd-right">
          <h1 className="pd-title">{productName}</h1>

          <p className="pd-brandline">
            <span className="pd-brand-name">{product.brand || ''}</span>
            {product.category ? <span className="pd-dot">•</span> : null}
            {product.category ? (
              <span className="pd-cat">{product.category}</span>
            ) : null}
          </p>

          <div className="pd-price-block">
            <div className="pd-price-left">
              {hasOriginal && (
                <span className="pd-old-price">
                  PKR {original.toLocaleString()}
                </span>
              )}

              <span className="pd-new-price">PKR {price.toLocaleString()}</span>

              {hasOriginal && discountPercent > 0 && (
                <span className="pd-sale-badge">{discountPercent}% OFF</span>
              )}
            </div>
          </div>

          <div className={`pd-stock-pill ${product.inStock ? 'in' : 'out'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>

          <p className="pd-desc">{productDescription}</p>

          {isReadyToWear && (
            <>
              <button
                className="pd-size-chart-btn"
                type="button"
                onClick={() => setShowSizeChart(true)}
              >
                View Size Chart{' '}
                {selectedSize ? `• Selected: ${selectedSize}` : ''}
              </button>


              <div className="pd-size-pills">
                {SIZE_OPTIONS.map((s) => {
                  // Only show sizes if they are included in product.size (comma separated)
                  // If product.size is missing/empty, show ALL or NONE? 
                  // Let's assume if size is saved it limits choices. If undefined, maybe show all (legacy support).
                  // But for new products, size IS defined.

                  // Clean up product sizes
                  const availableSizes = product.size
                    ? product.size.split(',').map(sz => sz.trim().toUpperCase())
                    : [];

                  // If product.size is empty string/null, fallback:
                  // 1. If 'isReadyToWear' is true, usually implying sizes exist. 
                  // Let's show pill DISABLED if not in list, or just HIDE it.
                  // User said "show availability", so showing all but disabling unavailable is often better UX.
                  // Or just showing meaningful ones. Let's SHOW ALL but DISABLE unavailable ones.

                  const isAvailable = availableSizes.length === 0 || availableSizes.includes(s);
                  // Note: availableSizes.length === 0 condition supports legacy items where size might be null but we want to allow selection? 
                  // Actually, strict mode: if sizes are defined, respect them.

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!isAvailable}
                      className={`pd-size-pill ${selectedSize === s ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      style={!isAvailable ? { opacity: 0.5, cursor: 'not-allowed', textDecoration: 'line-through' } : {}}
                      onClick={() => isAvailable && setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="pd-qty-row">
            <button
              className="qty-btn"
              onClick={() => qty > 1 && setQty(qty - 1)}
            >
              −
            </button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(qty + 1)}>
              +
            </button>

            <button
              className="add-bag"
              onClick={handleAddToCart}
              disabled={!product.inStock || (isReadyToWear && !selectedSize)}
              title={isReadyToWear && !selectedSize ? 'Select size first' : ''}
            >
              Add to Bag
            </button>
          </div>

          <div className="pd-action-row">
            <button
              className="pd-action-btn pd-action-wishlist"
              onClick={handleAddToWishlist}
            >
              <Heart size={16} />
              <span>Wishlist</span>
            </button>

            <button
              className="pd-action-btn pd-action-compare"
              onClick={openComparePage}
            >
              <Shuffle size={16} />
              <span>Compare</span>
            </button>
          </div>

          <div className="pd-details-box">
            <div className="pd-accordion">
              <div className="pd-accordion-item">
                <button
                  className="pd-accordion-header"
                  onClick={() => handleSectionToggle('details')}
                >
                  <span>Product Description</span>
                  <ChevronDown
                    size={18}
                    className={`pd-accordion-icon ${openSection === 'details' ? 'open' : ''
                      }`}
                  />
                </button>

                {openSection === 'details' && (
                  <div className="pd-accordion-body">
                    <div className="pd-details-content">
                      {product.details ? (
                        <div className="pd-details-pre">{product.details}</div>
                      ) : (
                        <p className="pd-detail-line">
                          No extra details provided.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pd-accordion-item">
                <button
                  className="pd-accordion-header"
                  onClick={() => handleSectionToggle('reviews')}
                >
                  <div className="pd-reviews-head">
                    <span>Customer Reviews</span>

                    <span className="pd-rating-summary">
                      {avgRating > 0 ? (
                        <>
                          <span className="pd-stars-pro">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={16}
                                className={`pd-star ${avgRating >= n ? 'filled' : ''
                                  }`}
                              />
                            ))}
                          </span>
                          <span className="pd-rating-num">
                            {avgRating.toFixed(1)}/5
                          </span>
                        </>
                      ) : (
                        <span className="pd-rating-num">No rating</span>
                      )}
                      <span className="pd-rating-count">({ratingText})</span>
                    </span>
                  </div>

                  <div className="pd-accordion-right">
                    <span className="pd-tab-badge">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`pd-accordion-icon ${openSection === 'reviews' ? 'open' : ''
                        }`}
                    />
                  </div>
                </button>

                {openSection === 'reviews' && (
                  <div className="pd-accordion-body">
                    {reviewCount === 0 ? (
                      <p className="pd-no-reviews">
                        There are no reviews yet for this product.
                      </p>
                    ) : (
                      <div className="pd-reviews-list">
                        {localReviews.map((r, index) => (
                          <div className="pd-review" key={index}>
                            <div className="pd-review-header">
                              <strong>{r.user || 'Customer'}</strong>
                              <span className="pd-review-rating">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    size={14}
                                    className={`pd-star-sm ${Number(r.rating || 0) >= n ? 'filled' : ''
                                      }`}
                                  />
                                ))}
                              </span>
                            </div>
                            <p className="pd-review-text">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      className="pd-review-form"
                      onSubmit={handleReviewSubmit}
                    >
                      <h4 className="pd-review-form-title">Write a Review</h4>

                      <div className="pd-review-form-row">
                        <div className="pd-review-form-field">
                          <label>Your Name</label>
                          <input
                            type="text"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      <div className="pd-review-form-row">
                        <div className="pd-review-form-field">
                          <label>Your Rating</label>
                          <div className="pd-rating-picker">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                className={`pd-star-btn ${reviewRating >= n ? 'active' : ''
                                  }`}
                                onClick={() => setReviewRating(n)}
                              >
                                <Star size={18} />
                              </button>
                            ))}
                            <span className="pd-rating-picker-text">
                              {reviewRating}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pd-review-form-row">
                        <div className="pd-review-form-field">
                          <label>Your Comment</label>
                          <textarea
                            rows="3"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                          />
                        </div>
                      </div>

                      <button type="submit" className="pd-review-submit">
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ bottom sections */}
      <div className="pd-bottom-sections">
        <section className="pd-section">
          <h3 className="pd-section-title">Complete the look</h3>

          {/* ✅ if empty => hide message */}
          {completeTheLook.length === 0 ? (
            <p className="pd-empty-text">
              No matching items yet to complete this look.
            </p>
          ) : (
            <div className="pd-related-grid complete-grid">
              {completeTheLook.map((item) => (
                <div
                  key={item.id}
                  className="pd-related-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={
                      item.image ||
                      (Array.isArray(item.images) ? item.images[0] : '')
                    }
                    alt={item.name || item.title}
                    className="pd-related-img complete-img"
                  />
                  <div className="pd-related-info">
                    <p className="pd-related-brand">{item.brand}</p>
                    <p className="pd-related-name">{item.name || item.title}</p>
                    <p className="pd-related-price">
                      PKR {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="pd-section">
          <h3 className="pd-section-title">Related Products</h3>
          <div className="pd-related-grid related-grid">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="pd-related-card"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img
                  src={
                    item.image ||
                    (Array.isArray(item.images) ? item.images[0] : '')
                  }
                  alt={item.name || item.title}
                  className="pd-related-img related-img"
                />
                <div className="pd-related-info">
                  <p className="pd-related-brand">{item.brand}</p>
                  <p className="pd-related-name">{item.name || item.title}</p>
                  <p className="pd-related-price">
                    PKR {Number(item.price).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ✅ SIZE CHART MODAL */}
      {showSizeChart && isReadyToWear && (
        <div
          className="pd-size-modal-backdrop"
          onClick={() => setShowSizeChart(false)}
        >
          <div className="pd-size-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pd-size-modal-header">
              <h4>Size Chart</h4>
              <button
                type="button"
                className="pd-size-modal-close"
                onClick={() => setShowSizeChart(false)}
              >
                ×
              </button>
            </div>

            <p className="pd-size-help">Click any size row to select.</p>

            <table className="pd-size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hip</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'XS', b: '32-33', w: '25-26', h: '34-35' },
                  { s: 'S', b: '34-35', w: '27-28', h: '36-37' },
                  { s: 'M', b: '36-37', w: '29-30', h: '38-39' },
                  { s: 'L', b: '38-40', w: '31-33', h: '40-42' },
                  { s: 'XL', b: '41-43', w: '34-36', h: '43-45' },
                  { s: 'XXL', b: '44-46', w: '37-40', h: '46-48' },
                ].map((row) => (
                  <tr
                    key={row.s}
                    className={`pd-size-row-click ${selectedSize === row.s ? 'active' : ''
                      }`}
                    onClick={() => {
                      setSelectedSize(row.s);
                      setShowSizeChart(false);
                    }}
                  >
                    <td>
                      <strong>{row.s}</strong>
                    </td>
                    <td>{row.b}</td>
                    <td>{row.w}</td>
                    <td>{row.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="pd-size-note">
              * Measurements are approximate and may vary slightly by brand and
              style.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
