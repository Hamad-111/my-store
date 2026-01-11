// src/pages/WomenPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import Banner from '../components/women/Banner';
import FiltersSidebar from '../components/women/FiltersSidebar';
import ProductCard from '../components/women/ProductCard';
import UnstitchedTypeHeader from '../components/women/UnstitchedTypeHeader';
import { useProducts } from '../context/ProductContext';
import WomenTypeHeader from '../components/women/WomenTypeHeader';

import './WomenPage.css';

export default function WomenPage() {
  // ✅ hooks always top
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { products: allProducts = [], loading } = useProducts() || {};

  const path = location.pathname;
  const isWomenPath = path === '/women';
  const isUnstitchedPath = path === '/unstitched';

  const urlType = (searchParams.get('type') || '').toLowerCase();
  const urlBrand = searchParams.get('brand') || '';
  const urlCategory = (searchParams.get('category') || '').toLowerCase();

  const isBrandPage = !!urlBrand;

  const UNSTITCHED_TYPES = [
    { key: 'winter', label: 'Winter' },
    { key: 'printed', label: 'Printed' },
    { key: 'embroidered', label: 'Embroidered' },
    { key: 'velvet', label: 'Velvet' },
  ];

  const isUnstitchedRoute =
    isUnstitchedPath &&
    ['winter', 'printed', 'embroidered', 'velvet'].includes(urlType);

  const isUnstitchedRoot = isUnstitchedPath && !urlType && !isBrandPage;

  const urlUnstitchedType =
    urlType === 'winter'
      ? 'WINTER'
      : urlType === 'printed'
        ? 'PRINTED'
        : urlType === 'embroidered'
          ? 'EMBROIDERED'
          : urlType === 'velvet'
            ? 'VELVET'
            : null;

  // ---------------- STATE ----------------
  const [sorting, setSorting] = useState('popularity');
  const [delivery, setDelivery] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState(
    urlBrand ? [urlBrand] : []
  );

  const [brandType, setBrandType] = useState('all');
  const [gridType, setGridType] = useState('four');

  const [unstitchedStyle, setUnstitchedStyle] = useState(null);
  const [unstitchedPiece, setUnstitchedPiece] = useState(null);

  // ---------------- HELPERS ----------------
  const resetAllFilters = () => {
    setSorting('popularity');
    setDelivery(null);
    setInStockOnly(false);

    setPriceMin('');
    setPriceMax('');

    setSelectedFabric([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]); // ✅ unstitched pe brand bhi reset
    setBrandType('all');

    setUnstitchedStyle(null);
    setUnstitchedPiece(null);

    setGridType('four');
  };

  // ✅ When urlBrand changes: set brand selection
  useEffect(() => {
    if (urlBrand) setSelectedBrands([urlBrand]);
    else setSelectedBrands([]);
  }, [urlBrand]);

  // ✅ Whenever type changes (or becomes empty), reset header selections
  useEffect(() => {
    setUnstitchedStyle(null);
    setUnstitchedPiece(null);
  }, [urlType]);

  // ✅ MAIN: Unstitched / subcategory pe navigate ho to filters clear (refresh)
  useEffect(() => {
    if (isUnstitchedPath) {
      resetAllFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnstitchedPath, urlType]);

  // ✅ Smooth scroll to top when any filter changes - REMOVED TO PREVENT CRASH
  // The global ScrollToTop component handles page navigation scrolling.
  // Aggressive scrolling on state change was causing conflicts during back navigation.

  const mapPriceRange = (label) => {
    switch (label) {
      case 'Below PKR 5000':
        return [0, 5000];
      case 'PKR 5000 - PKR 10,000':
        return [5000, 10000];
      case 'PKR 10,000 - PKR 15,000':
        return [10000, 15000];
      case 'PKR 15,000 - PKR 20,000':
        return [15000, 20000];
      case 'PKR 20,000 - PKR 30,000':
        return [20000, 30000];
      case 'Above PKR 30,000':
        return [30000, Infinity];
      default:
        return [0, Infinity];
    }
  };

  const bannerKey = isBrandPage
    ? `brand-${urlBrand.toLowerCase()}`
    : isUnstitchedRoute && unstitchedStyle
      ? `${urlType}-${String(unstitchedStyle).toLowerCase()}`
      : isWomenPath &&
        !isBrandPage &&
        !isUnstitchedPath &&
        !urlType &&
        !urlCategory
        ? 'women-root'
        : urlType || 'unstitched';

  // ---------------- FILTERED PRODUCTS ----------------
  const filteredProducts = useMemo(() => {
    let items = [...allProducts];
    // ✅ WOMEN ROUTES: keep ONLY women-side products (so men never appears)
    const isWomenRoute =
      isWomenPath ||
      isUnstitchedPath ||
      path === '/ready-to-wear' ||
      path === '/accessories';

    if (isWomenRoute) {
      items = items.filter((p) => {
        const cat = String(p.category || '').toLowerCase();
        const mc = String(p.mainCategory || '').toUpperCase();
        const sec = String(p.section || '').toLowerCase();

        return (
          cat === 'women' ||
          sec === 'women' ||
          mc === 'UNSTITCHED' ||
          mc === 'READY_TO_WEAR' ||
          mc === 'ACCESSORIES'
        );
      });
    }

    // ✅ /unstitched root and /unstitched?type=... => ONLY UNSTITCHED
    if (isUnstitchedPath) {
      items = items.filter(
        (p) => (p.mainCategory || '').toUpperCase() === 'UNSTITCHED'
      );
    }

    // ✅ type filters inside unstitched route
    if (isUnstitchedRoute && urlUnstitchedType) {
      items = items.filter(
        (p) => (p.unstitchedType || '').toUpperCase() === urlUnstitchedType
      );

      if (unstitchedStyle) {
        items = items.filter(
          (p) =>
            (p.style || '').toUpperCase() ===
            String(unstitchedStyle).toUpperCase()
        );
      }

      if (unstitchedPiece) {
        items = items.filter((p) => (p.pieces || '') === unstitchedPiece);
      }
    }

    // BRAND
    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    // COLOR
    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    // FABRIC
    if (selectedFabric.length > 0) {
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    }

    // SIZE (Unstitched me sidebar hide hai, but safety check)
    if (selectedSizes.length > 0) {
      items = items.filter((p) => {
        const productSize =
          p.size || (p.category === 'Unstitched' ? 'Unstitched' : null);
        return selectedSizes.includes(productSize);
      });
    }

    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price || 0) <= max);
    }

    // IN-STOCK
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // SORT
    items.sort((a, b) => {
      if (sorting === 'lowhigh')
        return Number(a.price || 0) - Number(b.price || 0);
      if (sorting === 'highlow')
        return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    // BRAND PAGE TYPE HEADER
    if (isBrandPage && brandType !== 'all') {
      const map = {
        unstitched: 'UNSTITCHED',
        ready: 'READY_TO_WEAR',
        accessories: 'ACCESSORIES',
      };
      const wanted = map[brandType];
      items = items.filter(
        (p) => (p.mainCategory || '').toUpperCase() === wanted
      );
    }

    return items;
  }, [
    allProducts,
    isUnstitchedPath,
    isUnstitchedRoute,
    urlUnstitchedType,
    unstitchedStyle,
    unstitchedPiece,
    selectedBrands,
    selectedColors,
    selectedFabric,
    selectedSizes,
    priceMin,
    priceMax,

    inStockOnly,
    sorting,
    brandType,
    isBrandPage,
  ]);

  const activeBrand = selectedBrands.length === 1 ? selectedBrands[0] : null;

  // ✅ Loading UI after hooks
  if (loading) {
    return <h2 style={{ padding: 20 }}>Loading...</h2>;
  }

  return (
    <div className="women-page">
      <Banner currentTag={bannerKey} />
      {isWomenPath &&
        !isUnstitchedPath &&
        !urlType &&
        !urlCategory &&
        !isBrandPage && <WomenTypeHeader />}
      {/* ✅ Unstitched root circles */}
      {isUnstitchedRoot && (
        <section className="u-type-wrapper u-type-wrapper-small">
          <h2 className="u-type-title u-type-title-small">UNSTITCHED</h2>

          <div className="u-type-circles-row-small">
            {UNSTITCHED_TYPES.map((t) => {
              const imageMap = {
                winter: '/images/product1.jfif',
                printed: '/images/product3.jfif',
                embroidered: '/images/product2.jfif',
                velvet: '/images/green6.jfif',
              };
              const imgSrc = imageMap[t.key] || '/images/product1.jfif';

              return (
                <button
                  key={t.key}
                  type="button"
                  className={`u-type-style-circle ${urlType === t.key ? 'active' : ''
                    }`}
                  onClick={() => {
                    // ✅ navigation itself triggers reset effect
                    navigate(`/unstitched?type=${t.key}`);
                  }}
                >
                  <div className="u-type-img-circle-small">
                    <img src={imgSrc} alt={t.label} />
                  </div>
                  <p className="u-type-label-small">{t.label}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ✅ Unstitched header for type routes */}
      {isUnstitchedRoute && (
        <UnstitchedTypeHeader
          type={urlUnstitchedType}
          activeStyle={unstitchedStyle}
          onStyleChange={setUnstitchedStyle}
          activePiece={unstitchedPiece}
          onPieceChange={setUnstitchedPiece}
        />
      )}

      <div className="women-main">
        <FiltersSidebar
          // filters
          sorting={sorting}
          setSorting={setSorting}
          delivery={delivery}
          setDelivery={setDelivery}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          selectedFabric={selectedFabric}
          setSelectedFabric={setSelectedFabric}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          // context
          isUnstitchedRoute={isUnstitchedRoute}
          unstitchedType={urlUnstitchedType}
          isUnstitchedPath={isUnstitchedPath}
          hideBrandFilter={isBrandPage}
          // ✅ clear button
          onClearFilters={resetAllFilters}
        />

        <section className="women-products">
          <div className="products-top-row">
            <div>
              <div className="products-count">
                Showing {filteredProducts.length} item
                {filteredProducts.length !== 1 ? 's' : ''}
              </div>

              {activeBrand && !isBrandPage && (
                <div className="brand-count-banner">
                  {filteredProducts.length} item
                  {filteredProducts.length !== 1 ? 's' : ''} found in{' '}
                  {activeBrand}
                </div>
              )}
            </div>

            <div className="grid-icons">
              <span
                className={gridType === 'two' ? 'active' : ''}
                onClick={() => setGridType('two')}
              >
                ≡
              </span>
              <span
                className={gridType === 'four' ? 'active' : ''}
                onClick={() => setGridType('four')}
              >
                ▤
              </span>
              <span
                className={gridType === 'six' ? 'active' : ''}
                onClick={() => setGridType('six')}
              >
                ▦
              </span>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-results">No Result Found</div>
          )}

          <div className={`products-grid products-grid-${gridType}`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
