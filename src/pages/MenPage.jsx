// ✅ src/pages/MenPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import MenBanner from '../components/men/MenBanner';
import MenFiltersSidebar from '../components/men/MenFiltersSidebar';
import MenTypeHeader from '../components/men/MenTypeHeader';

import ProductCard from '../components/women/ProductCard';
import { useProducts } from '../context/ProductContext';

import './MenPage.css';

export default function MenPage() {
  const { products: allProducts = [], loading } = useProducts() || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const sectionQ = (searchParams.get('section') || '').toLowerCase();
  const urlCategory = (searchParams.get('category') || '').toLowerCase();

  const isMenPath = location.pathname === '/men';
  const isRoot = isMenPath && !sectionQ;

  const MEN_CATEGORIES = [
    { key: 'kurta', label: 'Kurta', image: '/images/menkurti2.jfif' },
    {
      key: 'shalwar-kameez',
      label: 'Shalwar Kameez',
      image: '/images/menunstitched1.jfif',
    },
    { key: 'shirts', label: 'Shirts', image: '/images/menshirt1.jfif' },
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

  // ---------------- FILTER STATE ----------------
  const [sorting, setSorting] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  // ✅ desktop default = four, mobile default = two
  const [gridType, setGridType] = useState('four');

  // ✅ mobile drawer
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ keep grid valid on screen change
  useEffect(() => {
    if (isMobile) {
      if (gridType !== 'two' && gridType !== 'three') setGridType('two');
    } else {
      if (gridType === 'three') setGridType('four');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const resetAllFilters = useCallback(() => {
    setSorting('popularity');
    setInStockOnly(false);
    setPriceMin('');
    setPriceMax('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedFabrics([]);
    setGridType(isMobile ? 'two' : 'four');
  }, [isMobile]);

  useEffect(() => {
    resetAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  const onChangeCategory = (categoryKey) => {
    navigate(`/men?section=menswear&category=${categoryKey}`);
  };

  const filteredProducts = useMemo(() => {
    // ✅ 1) STRICT men products only
    let items = (allProducts || []).filter((p) => {
      const mc = String(p.mainCategory || '')
        .toUpperCase()
        .trim();
      const sec = String(p.section || '')
        .toLowerCase()
        .trim();
      const cat = String(p.category || '')
        .toLowerCase()
        .trim();
      return mc === 'MENSWEAR' || sec === 'menswear' || cat === 'men';
    });

    // ✅ de-dupe by id
    items = Array.from(new Map(items.map((p) => [String(p.id), p])).values());

    // ✅ 2) Category filter
    if (urlCategory) {
      items = items.filter((p) => {
        const sub = String(p.subCategory || '')
          .toLowerCase()
          .trim();
        const norm = sub.replace(/[_\s]+/g, '-');
        return norm === urlCategory;
      });
    }

    // ✅ 3) Sidebar filters
    if (selectedColors.length > 0)
      items = items.filter((p) => selectedColors.includes(p.color));
    if (selectedSizes.length > 0)
      items = items.filter((p) => selectedSizes.includes(p.size));
    if (selectedBrands.length > 0)
      items = items.filter((p) => selectedBrands.includes(p.brand));

    if (selectedFabrics.length > 0) {
      items = items.filter((p) => {
        const normalize = (s) =>
          String(s || '')
            .trim()
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/\s+/g, ' ');
        return selectedFabrics
          .map(normalize)
          .includes(normalize(p.fabric || p.material));
      });
    }

    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min))
      items = items.filter((p) => Number(p.price || 0) >= min);
    if (max !== null && !Number.isNaN(max))
      items = items.filter((p) => Number(p.price || 0) <= max);

    if (inStockOnly) items = items.filter((p) => p.inStock === true);

    // ✅ Sorting
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
    urlCategory,
    selectedColors,
    selectedSizes,
    selectedBrands,
    selectedFabrics,
    priceMin,
    priceMax,
    inStockOnly,
    sorting,
  ]);

  const bannerKey = isRoot
    ? 'men-root'
    : urlCategory
    ? `men-menswear-${urlCategory}`
    : 'men-menswear';

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div className="men-page">
      <MenBanner currentTag={bannerKey} />

      {isMenPath && (
        <MenTypeHeader
          title=""
          categories={MEN_CATEGORIES}
          activeCategory={urlCategory}
          onCategoryChange={onChangeCategory}
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

            <MenFiltersSidebar
              sorting={sorting}
              setSorting={setSorting}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedFabrics={selectedFabrics}
              setSelectedFabrics={setSelectedFabrics}
              activeCategory={urlCategory}
              isRoot={!urlCategory}
              onClearFilters={resetAllFilters}
            />
          </div>
        </>
      )}

      <div className="men-main">
        {/* ✅ DESKTOP sidebar only */}
        {!isMobile && (
          <MenFiltersSidebar
            sorting={sorting}
            setSorting={setSorting}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedFabrics={selectedFabrics}
            setSelectedFabrics={setSelectedFabrics}
            activeCategory={urlCategory}
            isRoot={!urlCategory}
            onClearFilters={resetAllFilters}
          />
        )}

        <section className="men-products">
          {/* ✅ MOBILE row: Filter + + ONLY Grid 2 / 3 */}
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

          {/* ✅ DESKTOP top row */}
          {!isMobile && (
            <div className="products-top-row">
              <div>
                <div className="products-count">
                  Showing {filteredProducts.length} item
                  {filteredProducts.length !== 1 ? 's' : ''}
                </div>
                <div className="men-subline">
                  Men • Menswear
                  {urlCategory ? ` • ${urlCategory.replace(/-/g, ' ')}` : ''}
                </div>
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
