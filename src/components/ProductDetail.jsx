// ✅ src/pages/ProductDetail.jsx (FULL REWRITE — with your SAME UI structure)
// ✅ Fixes you asked:
// 1) Complete the Look smart: 2-piece (shirt+dupatta) => bottom, 2-piece (shirt+trouser) => dupatta,
//    1-piece/top => bottom + dupatta, 3-piece => jewellery + hair + (optional)
//    Always try SAME color + similar fabric + any brand allowed
// 2) Related Products smart: same brand OR same category/mainCategory + same/near color + similar fabric + price range
// 3) Keeps your stock/qty + pending login logic exactly safe

import React, { useEffect, useMemo, useState } from 'react';
import './ProductDetail.css';
import { Heart, Shuffle, ChevronDown, Star } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { pushPendingAction } from '../utils/pendingActions';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { products: allProducts = [], loading } = useProducts() || {};
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState('');
  const [localReviews, setLocalReviews] = useState([]);
  const [openSection, setOpenSection] = useState(null);

  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  // ---------------- HELPERS ----------------
  const up = (v) =>
    String(v || '')
      .toUpperCase()
      .trim();
  const low = (v) =>
    String(v || '')
      .toLowerCase()
      .trim();

  const safeNum = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const textOf = (p) =>
    [
      p?.title,
      p?.name,
      p?.description,
      p?.longDescription,
      p?.tag,
      p?.style,
      p?.pieces,
      p?.subCategory,
      p?.rtwType,
      p?.rtwSubType,
      p?.unstitchedType,
      p?.category,
      p?.mainCategory,
    ]
      .filter(Boolean)
      .join(' ');

  const tokens = (s) =>
    low(s)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const jaccard = (aText, bText) => {
    const A = new Set(tokens(aText));
    const B = new Set(tokens(bText));
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const w of A) if (B.has(w)) inter++;
    const union = A.size + B.size - inter;
    return union ? inter / union : 0;
  };

  const pieceCount = (p) => {
    const s = low(p?.pieces);
    const m = s.match(/(\d)\s*piece/);
    if (m) return Number(m[1]);
    return 0;
  };

  const colorBucket = (c) => {
    const s = low(c);
    if (!s) return 'other';
    if (/(black|charcoal|jet)/.test(s)) return 'black';
    if (/(white|offwhite|ivory|cream)/.test(s)) return 'white';
    if (/(beige|sand|nude|camel|tan|khaki)/.test(s)) return 'beige';
    if (/(red|maroon|burgundy|crimson|wine)/.test(s)) return 'red';
    if (/(pink|fuchsia|rose|magenta)/.test(s)) return 'pink';
    if (/(blue|navy|sky|cobalt|teal)/.test(s)) return 'blue';
    if (/(green|olive|emerald|mint)/.test(s)) return 'green';
    if (/(yellow|mustard|gold)/.test(s)) return 'yellow';
    if (/(purple|violet|lilac)/.test(s)) return 'purple';
    if (/(brown|chocolate|coffee)/.test(s)) return 'brown';
    if (/(grey|gray|silver)/.test(s)) return 'grey';
    return s;
  };

  const fabricBucket = (f) => {
    const s = low(f);
    if (!s) return 'other';
    if (/cotton|cambric|lawn/.test(s)) return 'cotton';
    if (/khaddar|karandi/.test(s)) return 'khaddar';
    if (/linen/.test(s)) return 'linen';
    if (/chiffon|georgette|organza/.test(s)) return 'sheer';
    if (/silk|raw silk/.test(s)) return 'silk';
    if (/velvet/.test(s)) return 'velvet';
    return s;
  };

  const nearPrice = (base, cand, pct = 0.25) => {
    const b = safeNum(base, 0);
    const c = safeNum(cand, 0);
    if (b <= 0 || c <= 0) return false;
    return Math.abs(c - b) / b <= pct;
  };

  const uniqueById = (list) =>
    Array.from(new Map((list || []).map((x) => [String(x.id), x])).values());

  // ---------------- COMPLETE LOOK RULES ----------------
  const ACCESSORY_CATEGORIES = ['JEWELLRY', 'SHAWLS', 'HAIR ACCESSORIES'];
  const WOMEN_MAIN = ['UNSTITCHED', 'READY_TO_WEAR'];

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

  const isBottom = (p) => {
    const title = low(p?.title || p?.name);
    const sub = low(p?.subCategory);
    const rtw = low(p?.rtwType);
    const rtwSub = low(p?.rtwSubType);

    const bottomWords = [
      'trouser',
      'trousers',
      'pant',
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

  const hasDupattaInText = (p) => {
    const t = low(textOf(p));
    return t.includes('dupatta') || t.includes('dupata') || t.includes('shawl');
  };

  const hasBottomInText = (p) => {
    const t = low(textOf(p));
    return (
      t.includes('trouser') ||
      t.includes('trousers') ||
      t.includes('shalwar') ||
      t.includes('pants') ||
      t.includes('bottom')
    );
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

  // ✅ Stock
  const maxQty = useMemo(() => {
    return Math.max(0, Number(product?.stockQuantity || 0));
  }, [product?.stockQuantity]);

  const isOut = useMemo(() => {
    return product?.inStock === false || maxQty <= 0;
  }, [product?.inStock, maxQty]);

  useEffect(() => {
    setMainImg(allImages[0] || '');
    setLocalReviews(Array.isArray(product?.reviews) ? product.reviews : []);
    setOpenSection(null);
    setSelectedSize('');

    const mq = Math.max(0, Number(product?.stockQuantity || 0));
    setQty((prev) => {
      const start = 1;
      if (mq <= 0) return start;
      return Math.min(Math.max(1, prev || start), mq);
    });
  }, [product, allImages]);

  const productName = product?.title || product?.name || 'Product';
  const productDescription =
    product?.description ||
    product?.longDescription ||
    'No description available.';

  const isReadyToWear =
    up(product?.mainCategory) === 'READY_TO_WEAR' ||
    up(product?.category) === 'READYTOWEAR';

  const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSectionToggle = (section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const reviewCount = localReviews.length;

  const avgRating = useMemo(() => {
    if (!localReviews || localReviews.length === 0) return 0;
    const sum = localReviews.reduce((acc, r) => acc + safeNum(r.rating, 0), 0);
    return sum / localReviews.length;
  }, [localReviews]);

  const ratingText = useMemo(() => {
    if (reviewCount === 0) return 'No reviews yet';
    if (reviewCount === 1) return '1 Review';
    return `${reviewCount} Reviews`;
  }, [reviewCount]);

  const price = safeNum(product?.price, 0);
  const original = safeNum(product?.originalPrice, 0);
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

    const r = Math.max(1, Math.min(5, safeNum(reviewRating, 5)));
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

  // ---------------- SMART RELATED PRODUCTS ----------------
  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const base = product;
    const baseColor = colorBucket(base.color);
    const baseFabric = fabricBucket(base.fabric);
    const basePrice = safeNum(base.price, 0);
    const baseMain = up(base.mainCategory);
    const baseCat = up(base.category);
    const baseBrand = low(base.brand);

    const pool = (allProducts || []).filter(
      (p) => String(p.id) !== String(base.id)
    );

    const score = (cand) => {
      let s = 0;

      // same brand strongest
      if (baseBrand && low(cand.brand) === baseBrand) s += 28;

      // same main/category
      if (up(cand.mainCategory) === baseMain) s += 16;
      if (baseCat && up(cand.category) === baseCat) s += 10;

      // color bucket match
      if (colorBucket(cand.color) === baseColor) s += 18;

      // fabric bucket match
      if (fabricBucket(cand.fabric) === baseFabric) s += 12;

      // near price
      if (nearPrice(basePrice, cand.price, 0.3)) s += 14;

      // text similarity small
      s += Math.min(10, Math.round(jaccard(textOf(base), textOf(cand)) * 20));

      // in stock + popularity
      if (cand.inStock) s += 6;
      s += Math.min(10, safeNum(cand.popularity, 0) / 10);

      return s;
    };

    return pool
      .map((p) => ({ p, s: score(p) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p)
      .slice(0, 4);
  }, [allProducts, product]);

  // ---------------- SMART COMPLETE THE LOOK ----------------
  const completeTheLook = useMemo(() => {
    if (!product) return [];

    const base = product;
    const baseColor = colorBucket(base.color);
    const baseFabric = fabricBucket(base.fabric);

    const all = allProducts || [];
    const others = all.filter((p) => String(p.id) !== String(base.id));

    // pools
    const womenClothes = others.filter((p) => isWomenClothing(p));
    const menClothes = others.filter((p) => isMen(p) && !isAccessory(p));

    const jewelleryPool = others.filter(
      (p) => up(p.mainCategory) === 'JEWELLRY'
    );
    const shawlPool = others.filter(
      (p) => up(p.mainCategory) === 'SHAWLS' || hasDupattaInText(p)
    );
    const hairPool = others.filter(
      (p) => up(p.mainCategory) === 'HAIR ACCESSORIES'
    );
    const bottomPoolWomen = womenClothes.filter((p) => isBottom(p));
    const watchesPool = others.filter((p) => up(p.mainCategory) === 'WATCHES');

    // scoring by role
    const scoreRole = (cand, role) => {
      let s = 0;

      // role base
      if (role === 'bottom' && isBottom(cand)) s += 22;
      if (
        role === 'dupatta' &&
        (up(cand.mainCategory) === 'SHAWLS' || hasDupattaInText(cand))
      )
        s += 22;
      if (role === 'jewellery' && up(cand.mainCategory) === 'JEWELLRY') s += 18;
      if (role === 'hair' && up(cand.mainCategory) === 'HAIR ACCESSORIES')
        s += 12;
      if (role === 'watch' && up(cand.mainCategory) === 'WATCHES') s += 14;

      // strong color match
      if (colorBucket(cand.color) === baseColor) s += 24;

      // fabric match mainly for clothing + dupatta
      if (role === 'bottom' || role === 'dupatta') {
        if (fabricBucket(cand.fabric) === baseFabric) s += 14;
      }

      // in stock + popularity
      if (cand.inStock) s += 8;
      s += Math.min(10, safeNum(cand.popularity, 0) / 10);

      return s;
    };

    const pick = (pool, role, limit) =>
      pool
        .map((p) => ({ p, s: scoreRole(p, role) }))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p)
        .slice(0, limit);

    // decide need based on pieces content
    const pc = pieceCount(base);
    const baseHasDupatta = hasDupattaInText(base);
    const baseHasBottom = hasBottomInText(base);

    // default needs for women clothing:
    let needBottom = false;
    let needDupatta = false;

    // 1-piece shirt/kurti/top => bottom + dupatta
    if (pc === 1 || (pc === 0 && isTopOnly(base))) {
      needBottom = true;
      needDupatta = true;
    }

    // 2-piece rules
    if (pc === 2) {
      // shirt + dupatta => bottom
      if (baseHasDupatta && !baseHasBottom) needBottom = true;
      // shirt + trouser => dupatta
      if (baseHasBottom && !baseHasDupatta) needDupatta = true;

      // if unclear, fall back to top-only heuristic
      if (!baseHasBottom && !baseHasDupatta && isTopOnly(base)) {
        needBottom = true;
        needDupatta = true;
      }
    }

    // 3-piece => mostly accessories
    // also if base itself is shawl/jewellery etc:
    if (isAccessory(base)) {
      // if shawl, suggest top + bottom
      if (isShawl(base)) {
        const tops = womenClothes.filter((p) => isTopOnly(p));
        const bottoms = womenClothes.filter((p) => isBottom(p));
        return uniqueById([
          ...pick(tops, 'top', 2),
          ...pick(bottoms, 'bottom', 2),
        ]).slice(0, 4);
      }
      // other accessories: show nothing or only matching jewellery/hair
      const res = uniqueById([
        ...pick(jewelleryPool, 'jewellery', 2),
        ...pick(hairPool, 'hair', 2),
      ]).slice(0, 4);
      return res;
    }

    // men rules
    if (isMen(base)) {
      const bottoms = menClothes.filter((p) => isBottom(p));
      return uniqueById([
        ...pick(bottoms, 'bottom', 3),
        ...pick(watchesPool, 'watch', 1),
      ]).slice(0, 4);
    }

    // women clothing result
    let result = [];

    if (needBottom) result.push(...pick(bottomPoolWomen, 'bottom', 2));
    if (needDupatta) result.push(...pick(shawlPool, 'dupatta', 1));

    // always try jewellery match
    result.push(...pick(jewelleryPool, 'jewellery', 1));

    // if still less than 4 add hair
    if (result.length < 4) result.push(...pick(hairPool, 'hair', 1));

    return uniqueById(result).slice(0, 4);
  }, [allProducts, product]);

  function openComparePage() {
    if (!product) return;
    navigate('/compare', { state: { baseProduct: product } });
  }

  // ✅ pending helper
  const goLoginWithPending = (type, safeQty) => {
    if (!product) return;

    if (isReadyToWear && !selectedSize) {
      alert('Please select a size first.');
      return;
    }

    const snapshot = {
      id: String(product.id),
      title: productName,
      name: productName,
      brand: product.brand || '',
      image: product.image || allImages[0] || '',
      price: safeNum(product.price, 0),
      salePercent: safeNum(product.salePercent, 0),
      originalPrice: safeNum(product.originalPrice || product.price, 0),

      stockQuantity: Math.max(0, safeNum(product?.stockQuantity, 0)),
      inStock:
        product?.inStock !== false &&
        Math.max(0, safeNum(product?.stockQuantity, 0)) > 0,
    };

    const redirectBack =
      type === 'ADD_TO_CART'
        ? '/cart'
        : type === 'ADD_TO_WISHLIST'
          ? '/wishlist'
          : '/';

    if (type === 'ADD_TO_CART') {
      pushPendingAction({
        type: 'ADD_TO_CART',
        productId: String(product.id),
        qty: Number(safeQty || 1),
        size: isReadyToWear ? selectedSize || null : null,
        redirectBack,
        snapshot,
      });
    }

    if (type === 'ADD_TO_WISHLIST') {
      pushPendingAction({
        type: 'ADD_TO_WISHLIST',
        productId: String(product.id),
        size: isReadyToWear ? selectedSize || null : null,
        redirectBack,
        snapshot,
      });
    }

    navigate('/login', { state: { pulse: true, from: location?.pathname } });
  };

  function handleAddToCart() {
    if (!product) return;

    const mq = Math.max(0, safeNum(product?.stockQuantity, 0));
    const out = product?.inStock === false || mq <= 0;
    if (out) return;

    const safeQty = Math.min(Math.max(1, safeNum(qty, 1)), mq);

    if (isReadyToWear && !selectedSize) {
      alert('Please select a size first.');
      return;
    }

    if (!user) {
      setQty(safeQty);
      goLoginWithPending('ADD_TO_CART', safeQty);
      return;
    }

    addToCart({
      id: String(product.id),
      name: productName,
      brand: product.brand,
      image: product.image || allImages[0] || '',
      price: safeNum(product.price, 0),
      salePercent: safeNum(product.salePercent, 0),
      originalPrice: safeNum(product.originalPrice || product.price, 0),
      qty: safeQty,
      size: isReadyToWear ? selectedSize : null,

      stockQuantity: mq,
      inStock: true,
    });

    navigate('/cart');
  }

  function handleAddToWishlist() {
    if (!product) return;

    if (isReadyToWear && !selectedSize) {
      alert('Please select a size first.');
      return;
    }

    if (!user) {
      goLoginWithPending('ADD_TO_WISHLIST', 1);
      return;
    }

    addToWishlist({
      id: String(product.id),
      name: productName,
      brand: product.brand,
      image: product.image || allImages[0] || '',
      price: safeNum(product.price, 0),
      salePercent: safeNum(product.salePercent, 0),
      originalPrice: safeNum(product.originalPrice || product.price, 0),
      size: isReadyToWear ? selectedSize || null : null,

      stockQuantity: Math.max(0, safeNum(product?.stockQuantity, 0)),
      inStock:
        product?.inStock !== false &&
        Math.max(0, safeNum(product?.stockQuantity, 0)) > 0,
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

          <div className={`pd-stock-pill ${!isOut ? 'in' : 'out'}`}>
            {!isOut ? 'In Stock' : 'Out of Stock'}
            {!isOut && maxQty ? (
              <span style={{ marginLeft: 10, opacity: 0.8 }}>
                (Available: {maxQty})
              </span>
            ) : null}
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
                  const availableSizes = product.size
                    ? String(product.size)
                        .split(',')
                        .map((sz) => sz.trim().toUpperCase())
                    : [];

                  const isAvailable =
                    availableSizes.length === 0 || availableSizes.includes(s);

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!isAvailable}
                      className={`pd-size-pill ${
                        selectedSize === s ? 'active' : ''
                      } ${!isAvailable ? 'disabled' : ''}`}
                      style={
                        !isAvailable
                          ? {
                              opacity: 0.5,
                              cursor: 'not-allowed',
                              textDecoration: 'line-through',
                            }
                          : {}
                      }
                      onClick={() => isAvailable && setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ✅ Qty + Add */}
          <div className="pd-qty-row">
            <button
              className="qty-btn"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={isOut || qty <= 1}
              title={isOut ? 'Out of stock' : ''}
            >
              −
            </button>

            <span className="qty-value">{qty}</span>

            <button
              className="qty-btn"
              onClick={() => setQty((q) => Math.min(maxQty || 1, q + 1))}
              disabled={isOut || qty >= maxQty}
              title={qty >= maxQty ? `Max ${maxQty} available` : ''}
            >
              +
            </button>

            {!isOut ? (
              <button
                className="add-bag"
                onClick={handleAddToCart}
                disabled={isReadyToWear && !selectedSize}
                title={
                  isReadyToWear && !selectedSize ? 'Select size first' : ''
                }
              >
                Add to Bag {maxQty ? `(Max ${maxQty})` : ''}
              </button>
            ) : (
              <button
                className="add-bag"
                type="button"
                disabled
                title="Out of stock"
              >
                Out of Stock
              </button>
            )}
          </div>

          <div className="pd-action-row">
            <button
              className="pd-action-btn pd-action-wishlist"
              onClick={handleAddToWishlist}
              disabled={isOut}
              title={isOut ? 'Out of stock' : 'Wishlist'}
              style={isOut ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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

          {/* Accordion */}
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
                    className={`pd-accordion-icon ${
                      openSection === 'details' ? 'open' : ''
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
                                className={`pd-star ${
                                  avgRating >= n ? 'filled' : ''
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
                      className={`pd-accordion-icon ${
                        openSection === 'reviews' ? 'open' : ''
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
                                    className={`pd-star-sm ${
                                      safeNum(r.rating, 0) >= n ? 'filled' : ''
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
                                className={`pd-star-btn ${
                                  reviewRating >= n ? 'active' : ''
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
                      PKR {safeNum(item.price, 0).toLocaleString()}
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
                    PKR {safeNum(item.price, 0).toLocaleString()}
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
                    className={`pd-size-row-click ${
                      selectedSize === row.s ? 'active' : ''
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
