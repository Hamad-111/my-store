// src/pages/AccessoriesPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import AccessoriesBanner from '../components/accessories/AccessoriesBanner';
import AccessoriesTypeHeader from '../components/accessories/AccessoriesTypeHeader';
import AccessoriesFiltersSidebar from '../components/accessories/AccessoriesFiltersSidebar';
import AccessoryProductCard from '../components/accessories/AccessoryProductCard';
import { useProducts } from '../context/ProductContext';

import './WomenPage.css';

// ✅ ONLY these categories (bags/footwear/watches removed)
const ACCESSORY_CATEGORIES = ['JEWELLRY', 'SHAWLS', 'HAIR ACCESSORIES'];

export default function AccessoriesPage() {
  const { products = [], loading } = useProducts() || {};
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ---------------- MOBILE DETECT ----------------
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 800px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // ✅ Keep urlCat as-is (don’t convert hyphen to space)
  const urlCat = (searchParams.get('cat') || '').toLowerCase().trim();

  // ✅ category mapping fixed (hair-accessories works now)
  const mainCategory =
    urlCat === 'jewellery'
      ? 'JEWELLRY'
      : urlCat === 'shawls'
        ? 'SHAWLS'
        : urlCat === 'hair-accessories'
          ? 'HAIR ACCESSORIES'
          : null;

  // ---------- FILTER STATE ----------
  const [sorting, setSorting] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedTone, setSelectedTone] = useState([]);

  const [activeSubCategory, setActiveSubCategory] = useState(null);

  // ✅ desktop default = four, mobile default = two
  const [gridType, setGridType] = useState('four');

  // ✅ mobile drawer
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ keep grid valid on screen change
  useEffect(() => {
    const sub = searchParams.get('sub');
    setActiveSubCategory(sub || null);
    if (isMobile) {
      if (gridType !== 'two' && gridType !== 'three') setGridType('two');
    } else {
      if (gridType === 'three') setGridType('four');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, searchParams]);

  // ✅ RESET ALL
  const resetAllFilters = useCallback(() => {
    setSorting('popularity');
    setInStockOnly(false);

    setPriceMin('');
    setPriceMax('');

    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSelectedTone([]);

    setActiveSubCategory(null);
    setGridType(isMobile ? 'two' : 'four');
  }, [isMobile]);

  const bannerKey = urlCat || 'accessories';

  const filteredProducts = useMemo(() => {
    // only accessories (limited)
    let items = (products || []).filter((p) =>
      ACCESSORY_CATEGORIES.includes(String(p.mainCategory || '').toUpperCase())
    );

    // category filter (if any)
    if (mainCategory) {
      items = items.filter(
        (p) => String(p.mainCategory || '').toUpperCase() === mainCategory
      );
    }

    // subcategory filter
    if (activeSubCategory) {
      items = items.filter((p) => (p.subCategory || '') === activeSubCategory);
    }

    // brands
    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    // colors
    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    // materials
    if (selectedMaterials.length > 0) {
      items = items.filter((p) => selectedMaterials.includes(p.material));
    }

    // sizes
    if (selectedSizes.length > 0) {
      items = items.filter((p) =>
        p.size ? selectedSizes.includes(p.size) : false
      );
    }

    // tone (jewellery)
    if (selectedTone.length > 0) {
      items = items.filter((p) =>
        p.tone ? selectedTone.includes(p.tone) : false
      );
    }

    // price
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min))
      items = items.filter((p) => Number(p.price || 0) >= min);
    if (max !== null && !Number.isNaN(max))
      items = items.filter((p) => Number(p.price || 0) <= max);

    // stock
    if (inStockOnly) items = items.filter((p) => p.inStock);

    // sorting
    items.sort((a, b) => {
      if (sorting === 'lowhigh')
        return Number(a.price || 0) - Number(b.price || 0);
      if (sorting === 'highlow')
        return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    return items;
  }, [
    products,
    mainCategory,
    activeSubCategory,
    selectedBrands,
    selectedColors,
    selectedMaterials,
    selectedSizes,
    selectedTone,
    priceMin,
    priceMax,
    inStockOnly,
    sorting,
  ]);

  if (loading) {
    return (
      <div
        className="women-page"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <h2>Loading accessories...</h2>
      </div>
    );
  }

  return (
    <div className="women-page">
      <AccessoriesBanner currentTag={bannerKey} />

      <AccessoriesTypeHeader
        mainCategory={mainCategory}
        activeSubCategory={activeSubCategory}
        onSubCategoryChange={(subKey) => {
          setActiveSubCategory(subKey);

          const params = new URLSearchParams(searchParams.toString());
          params.set('sub', subKey); // ✅ URL set
          navigate(`/accessories?${params.toString()}`);
        }}
      />

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

            <AccessoriesFiltersSidebar
              mainCategory={mainCategory}
              sorting={sorting}
              setSorting={setSorting}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedMaterials={selectedMaterials}
              setSelectedMaterials={setSelectedMaterials}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              onClearFilters={resetAllFilters}
            />
          </div>
        </>
      )}

      <div className="women-main">
        {/* ✅ DESKTOP sidebar only */}
        {!isMobile && (
          <AccessoriesFiltersSidebar
            mainCategory={mainCategory}
            sorting={sorting}
            setSorting={setSorting}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedTone={selectedTone}
            setSelectedTone={setSelectedTone}
            onClearFilters={resetAllFilters}
          />
        )}

        <section className="women-products">
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

          {/* ✅ DESKTOP top row (old) */}
          {!isMobile && (
            <div className="products-top-row">
              <div className="products-count">
                Showing {filteredProducts.length} item
                {filteredProducts.length !== 1 ? 's' : ''}{' '}
                {mainCategory ? `in ${mainCategory}` : ''}
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
              <AccessoryProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
