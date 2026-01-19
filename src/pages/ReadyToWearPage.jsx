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
  const { products: allProducts = [], loading } = useProducts() || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const urlType = (searchParams.get('type') || '').toLowerCase();
  const urlSub = searchParams.get('sub') || '';

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

  // ---------------- MOBILE DETECT ----------------
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

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

  // ✅ desktop default: four, mobile default: two
  const [gridType, setGridType] = useState('four');
  const [readySubType, setReadySubType] = useState(null);

  // ✅ mobile drawer
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ keep grid valid on screen change
  useEffect(() => {
    const sub = searchParams.get('sub');
    setReadySubType(sub || null);
    if (isMobile) {
      // mobile only: two / three
      if (gridType !== 'two' && gridType !== 'three') setGridType('two');
    } else {
      // desktop: two / four / six
      if (gridType === 'three') setGridType('four');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, searchParams]);

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
    setGridType(isMobile ? 'two' : 'four');
  };

  // ✅ type change pe subType reset
  useEffect(() => {
    setReadySubType(null);
  }, [urlType]);

  // ✅ optional scroll
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

  const bannerKey = urlType ? `rtw-${urlType}` : 'rtw-default';

  const filteredProducts = useMemo(() => {
    let items = (allProducts || []).filter((p) => {
      const main = String(p.mainCategory || '')
        .toUpperCase()
        .trim();
      const cat = String(p.category || '')
        .toUpperCase()
        .trim();
      return main === 'READY_TO_WEAR' && cat === 'READYTOWEAR';
    });

    // unique by id
    items = Array.from(new Map(items.map((p) => [String(p.id), p])).values());

    if (urlReadyType) {
      items = items.filter(
        (p) => (p.rtwType || '').toUpperCase() === urlReadyType
      );
    }

    if (readySubType) {
      items = items.filter(
        (p) => (p.rtwSubType || '').toUpperCase() === readySubType.toUpperCase()
      );
    }

    if (selectedBrands.length > 0)
      items = items.filter((p) => selectedBrands.includes(p.brand));
    if (selectedColors.length > 0)
      items = items.filter((p) => selectedColors.includes(p.color));
    if (selectedFabric.length > 0)
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    if (selectedSizes.length > 0)
      items = items.filter((p) => selectedSizes.includes(p.size || null));

    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min))
      items = items.filter((p) => Number(p.price || 0) >= min);
    if (max !== null && !Number.isNaN(max))
      items = items.filter((p) => Number(p.price || 0) <= max);

    if (inStockOnly) items = items.filter((p) => p.inStock);

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
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('type', t.key);
                  params.delete('sub'); // ✅ type change pe sub reset
                  navigate(`/ready-to-wear?${params.toString()}`);
                }}
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
          onSubTypeChange={(subKey) => {
            setReadySubType(subKey);

            const params = new URLSearchParams(searchParams.toString());
            params.set('sub', subKey); // ✅ URL me sub set
            navigate(`/ready-to-wear?${params.toString()}`);
          }}
        />
      )}

      {/* ✅ MOBILE FILTER DRAWER */}
      {isMobile && (
        <>
          <div
            className={`mobile-filter-overlay ${filterOpen ? 'open' : ''}`}
            onClick={() => setFilterOpen(false)}
          />
          <div className={`mobile-filter-drawer ${filterOpen ? 'open' : ''}`}>
            <div className="mobile-filter-drawer-header">
              <div className="mobile-filter-drawer-title">Filters</div>
              <button
                className="mobile-filter-close"
                onClick={() => setFilterOpen(false)}
              >
                ✕
              </button>
            </div>

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
              onClearFilters={resetAllFilters}
            />
          </div>
        </>
      )}

      <div className="women-main">
        {/* ✅ DESKTOP sidebar only */}
        {!isMobile && (
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
            onClearFilters={resetAllFilters}
          />
        )}

        <section className="women-products">
          {/* ✅ MOBILE ROW: Filter+ + only Grid 2/3 icons */}
          {isMobile && (
            <div className="mobile-filter-row">
              <button
                className="mobile-filter-btn"
                onClick={() => setFilterOpen(true)}
              >
                Filter +
              </button>

              <div className="grid-icons">
                <span
                  className={gridType === 'two' ? 'active' : ''}
                  onClick={() => setGridType('two')}
                  title="2 Columns"
                >
                  ▦
                </span>
                <span
                  className={gridType === 'three' ? 'active' : ''}
                  onClick={() => setGridType('three')}
                  title="3 Columns"
                >
                  ▤
                </span>
              </div>
            </div>
          )}

          {/* ✅ DESKTOP TOP ROW (old) */}
          {!isMobile && (
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
          )}

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
