// src/pages/ReadyToWearPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

import Banner from '../components/women/Banner';

import ProductCard from '../components/women/ProductCard';
import ReadyTypeHeader from '../components/women/ReadyTypeHeader';
import FiltersSidebarRTW from '../components/women/FiltersSidebarRTW';
import { useProducts } from '../context/ProductContext';

import './WomenPage.css';
export default function ReadyToWearPage() {
  // ✅ hooks top
  const { products: allProducts = [], loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const urlType = (searchParams.get('type') || '').toLowerCase();
  const urlReadyType = urlType ? urlType.toUpperCase() : null;

  const READY_TYPES = [
    {
      key: 'embroidered',
      label: 'Embroidered',
      img: '/images/embroidary1.jfif',
    },
    { key: 'printed', label: 'Printed', img: '/images/printed.jfif' },
    { key: 'solids', label: 'Solids', img: '/images/solid.jfif' },
    { key: 'coords', label: 'Co-ords', img: '/images/cords1.jfif' },
    { key: 'formals', label: 'Formals', img: '/images/formals.jfif' },
    { key: 'kurtis', label: 'Kurtis', img: '/images/kurtis5.jfif' },
    { key: 'bottoms', label: 'Bottoms', img: '/images/womenbottom5.jfif' },
  ];

  // ---------- STATE ----------
  const [sorting, setSorting] = useState('popularity');
  const [delivery, setDelivery] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [gridType, setGridType] = useState('four');
  const [readySubType, setReadySubType] = useState(null);

  // ---------- HELPERS ----------
  const resetAllFilters = () => {
    setSorting('popularity');
    setDelivery(null);
    setInStockOnly(false);

    setPriceMin('');
    setPriceMax('');

    setSelectedFabric([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);

    setReadySubType(null);
    setGridType('four');
  };

  // ✅ type change pe subType reset
  useEffect(() => {
    setReadySubType(null);
  }, [urlType]);

  // ✅ optional: route change pe scroll top (women jaisa)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    sorting,
    delivery,
    inStockOnly,
    priceMin,
    priceMax,

    selectedFabric,
    selectedSizes,
    selectedColors,
    selectedBrands,
    readySubType,
    gridType,
    location.pathname,
    urlType,
  ]);

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

  const bannerKey = urlType ? `rtw-${urlType}` : 'rtw-default';

  const filteredProducts = useMemo(() => {
    // ✅ ONLY READY TO WEAR
    let items = (allProducts || []).filter((p) => {
      const main = String(p.mainCategory || '')
        .toUpperCase()
        .trim();
      const cat = String(p.category || '')
        .toUpperCase()
        .trim();
      return main === 'READY_TO_WEAR' && cat === 'READYTOWEAR';
    });
    items = Array.from(new Map(items.map((p) => [String(p.id), p])).values());

    // ✅ main type
    if (urlReadyType) {
      items = items.filter(
        (p) => (p.rtwType || '').toUpperCase() === urlReadyType
      );
    }

    // ✅ subtype (pills)
    if (readySubType) {
      items = items.filter(
        (p) => (p.rtwSubType || '').toUpperCase() === readySubType.toUpperCase()
      );
    }

    // ✅ brand
    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    // ✅ color
    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    // ✅ fabric
    if (selectedFabric.length > 0) {
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    }

    // ✅ size
    if (selectedSizes.length > 0) {
      items = items.filter((p) => selectedSizes.includes(p.size || null));
    }

    // ✅ price
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price || 0) <= max);
    }

    // ✅ stock
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // ✅ sort
    items.sort((a, b) => {
      if (sorting === 'lowhigh')
        return Number(a.price || 0) - Number(b.price || 0);
      if (sorting === 'highlow')
        return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    return items;
  }, [
    allProducts,
    urlReadyType,
    readySubType,
    selectedBrands,
    selectedColors,
    selectedFabric,
    selectedSizes,
    priceMin,
    priceMax,

    inStockOnly,
    sorting,
  ]);

  const activeBrand = selectedBrands.length === 1 ? selectedBrands[0] : null;

  if (loading) {
    return (
      <div
        className="women-page"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <h2>Loading ready to wear...</h2>
      </div>
    );
  }

  return (
    <div className="women-page">
      <Banner currentTag={bannerKey} />

      {/* ✅ MAIN RTW TYPE CIRCLES – show ONLY when no type selected */}
      {!urlReadyType && (
        <section className="u-type-wrapper u-type-wrapper-small">
          <h2 className="u-type-title u-type-title-small">READY TO WEAR</h2>

          <div className="u-type-circles-row-small">
            {READY_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`u-type-style-circle ${
                  urlType === t.key ? 'active' : ''
                }`}
                onClick={() => navigate(`/ready-to-wear?type=${t.key}`)}
              >
                <div className="u-type-img-circle-small">
                  <img src={t.img} alt={t.label} />
                </div>
                <p className="u-type-label-small">{t.label}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ✅ INNER HEADER – show ONLY when type selected */}
      {urlReadyType && (
        <ReadyTypeHeader
          type={urlReadyType}
          activeSubType={readySubType}
          onSubTypeChange={setReadySubType}
        />
      )}

      <div className="women-main">
        <FiltersSidebarRTW
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
          // ✅ RTW is NOT unstitched
          isUnstitchedRoute={false}
          unstitchedType={null}
          isUnstitchedPath={false}
          // ✅ clear button working
          onClearFilters={resetAllFilters}
        />

        <section className="women-products">
          <div className="products-top-row">
            <div>
              <div className="products-count">
                Showing {filteredProducts.length} item
                {filteredProducts.length !== 1 ? 's' : ''}
              </div>

              {activeBrand && (
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
