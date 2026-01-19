import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import Banner from '../components/women/Banner';
import FiltersSidebar from '../components/women/FiltersSidebar';
import ProductCard from '../components/women/ProductCard';
import UnstitchedTypeHeader from '../components/women/UnstitchedTypeHeader';
import { useProducts } from '../context/ProductContext';
import WomenTypeHeader from '../components/women/WomenTypeHeader';

import './WomenPage.css';

export default function WomenPage() {
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
  const urlStyle = searchParams.get('style') || '';
  const urlPieces = searchParams.get('pieces') || '';

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

  // ---------------- MOBILE DETECT ----------------
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

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

  // ✅ desktop default = four, mobile default = two
  const [gridType, setGridType] = useState('four');

  const [unstitchedStyle, setUnstitchedStyle] = useState(null);
  const [unstitchedPiece, setUnstitchedPiece] = useState(null);

  // ✅ mobile drawer
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ if screen changes, keep grid valid
  // ✅ auto-set first style in URL when type has styles (WINTER/PRINTED/EMBROIDERED)
  useEffect(() => {
    if (!isUnstitchedRoute) return;

    // ✅ Velvet has no style circles
    if (urlUnstitchedType === 'VELVET') return;

    // agar style already URL me hai, kuch nahi karna
    const currentStyle = searchParams.get('style');
    if (currentStyle) return;

    // ✅ first style by type (same mapping as UnstitchedTypeHeader)
    const FIRST_STYLE_BY_TYPE = {
      WINTER: 'PRINTED',
      PRINTED: 'SIGNATURE',
      EMBROIDERED: 'SIGNATURE',
    };

    const first = FIRST_STYLE_BY_TYPE[urlUnstitchedType];
    if (!first) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('type', urlType);
    params.set('style', first);
    params.delete('pieces'); // reset pieces

    navigate(`/unstitched?${params.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnstitchedRoute, urlUnstitchedType, urlType]);

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
    setSelectedBrands([]);
    setBrandType('all');

    setUnstitchedStyle(null);
    setUnstitchedPiece(null);

    setGridType(isMobile ? 'two' : 'four');
  };

  useEffect(() => {
    if (urlBrand) setSelectedBrands([urlBrand]);
    else setSelectedBrands([]);
  }, [urlBrand]);

  useEffect(() => {
    const s = searchParams.get('style');
    const p = searchParams.get('pieces');

    setUnstitchedStyle(s || null);
    setUnstitchedPiece(p || null);
  }, [urlType, searchParams]);

  useEffect(() => {
    if (isUnstitchedPath) resetAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnstitchedPath, urlType]);

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

    if (isUnstitchedPath) {
      items = items.filter(
        (p) => (p.mainCategory || '').toUpperCase() === 'UNSTITCHED'
      );
    }

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

    if (selectedBrands.length > 0)
      items = items.filter((p) => selectedBrands.includes(p.brand));
    if (selectedColors.length > 0)
      items = items.filter((p) => selectedColors.includes(p.color));
    if (selectedFabric.length > 0)
      items = items.filter((p) => selectedFabric.includes(p.fabric));

    if (selectedSizes.length > 0) {
      items = items.filter((p) => {
        const productSize =
          p.size || (p.category === 'Unstitched' ? 'Unstitched' : null);
        return selectedSizes.includes(productSize);
      });
    }

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
    isWomenPath,
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
    path,
  ]);

  const activeBrand = selectedBrands.length === 1 ? selectedBrands[0] : null;

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

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
                  className={`u-type-style-circle ${
                    urlType === t.key ? 'active' : ''
                  }`}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('type', t.key);
                    params.delete('style');
                    params.delete('pieces');
                    navigate(`/unstitched?${params.toString()}`);
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
          onStyleChange={(styleKey) => {
            setUnstitchedStyle(styleKey);
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', urlType);
            params.set('style', styleKey);
            params.delete('pieces'); // ✅ style change pe pieces reset
            navigate(`/unstitched?${params.toString()}`);
          }}
          activePiece={unstitchedPiece}
          onPieceChange={(piece) => {
            setUnstitchedPiece(piece);
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', urlType);
            if (piece) params.set('pieces', piece);
            else params.delete('pieces');
            navigate(`/unstitched?${params.toString()}`);
          }}
        />
      )}

      {/* ✅ MOBILE FILTER DRAWER (only on mobile) */}
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

            <FiltersSidebar
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
              isUnstitchedRoute={isUnstitchedRoute}
              unstitchedType={urlUnstitchedType}
              isUnstitchedPath={isUnstitchedPath}
              hideBrandFilter={isBrandPage}
              onClearFilters={resetAllFilters}
            />
          </div>
        </>
      )}

      <div className="women-main">
        {/* ✅ DESKTOP sidebar only */}
        {!isMobile && (
          <FiltersSidebar
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
            isUnstitchedRoute={isUnstitchedRoute}
            unstitchedType={urlUnstitchedType}
            isUnstitchedPath={isUnstitchedPath}
            hideBrandFilter={isBrandPage}
            onClearFilters={resetAllFilters}
          />
        )}

        <section className="women-products">
          {/* ✅ MOBILE row: Filter + + Grid icons */}
          {isMobile && (
            <div className="mobile-filter-row">
              <button
                className="mobile-filter-btn"
                onClick={() => setFilterOpen(true)}
              >
                Filter +
              </button>

              {/* ✅ MOBILE: only Grid 2 and Grid 3 */}
              <div className="grid-icons">
                <span
                  className={gridType === 'two' ? 'active' : ''}
                  onClick={() => setGridType('two')}
                >
                  ▦
                </span>
                <span
                  className={gridType === 'three' ? 'active' : ''}
                  onClick={() => setGridType('three')}
                >
                  ▤
                </span>
              </div>
            </div>
          )}

          {/* ✅ Desktop top row (old) */}
          {!isMobile && (
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
