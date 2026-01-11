// ✅ src/pages/SearchPage.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import ProductCard from '../components/women/ProductCard';
import FiltersSidebar from '../components/women/FiltersSidebar';
import { useProducts } from '../context/ProductContext';

import './WomenPage.css';

const norm = (v) =>
  String(v || '')
    .toLowerCase()
    .trim();

const buildSearchText = (p) => {
  const parts = [
    p?.title,
    p?.name,
    p?.brand,
    p?.tag,
    p?.mainCategory,
    p?.subCategory,
    p?.category,
    p?.unstitchedType,
    p?.rtwType,
    p?.rtwSubType,
    p?.style,
    p?.pieces,
    p?.fabric,
    p?.material,
    p?.color,
  ];

  if (Array.isArray(p?.tags)) parts.push(...p.tags);

  return norm(parts.filter(Boolean).join(' '));
};

const matchesQuery = (p, q) => {
  if (!q) return false;
  const text = buildSearchText(p);

  // allow multi-word search: "winter black printed"
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  // AND logic: every token must exist somewhere in product text
  return tokens.every((t) => text.includes(t));
};

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

export default function SearchPage() {
  const { products: allProducts = [], loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const query = searchParams.get('q') || '';
  const qNorm = norm(query);

  // ---------------- FILTER STATES ----------------
  const [sorting, setSorting] = useState('popularity');

  const [delivery, setDelivery] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  // ✅ use min/max because your Women/Men pages use these
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // ✅ if your sidebar uses "selectedPrice" labels, keep it too (safe)
  const [selectedPrice, setSelectedPrice] = useState(null);

  const [gridType, setGridType] = useState('four');

  const resetAllFilters = () => {
    setSorting('popularity');
    setDelivery(null);
    setInStockOnly(false);

    setPriceMin('');
    setPriceMax('');

    setSelectedFabric([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedSizes([]);

    setSelectedPrice(null);
    setGridType('four');
  };

  // ✅ reset filters when query changes
  useEffect(() => {
    resetAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qNorm]);

  const filteredProducts = useMemo(() => {
    if (!qNorm) return [];

    // 1) SEARCH MATCH (title/brand/tag/category/type/color etc.)
    let items = (allProducts || []).filter((p) => matchesQuery(p, qNorm));

    // 2) SIDEBAR FILTERS
    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    if (selectedFabric.length > 0) {
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    }

    if (selectedSizes.length > 0) {
      items = items.filter((p) => selectedSizes.includes(p.size || null));
    }

    // ✅ Price from label (if your sidebar provides selectedPrice)
    if (selectedPrice) {
      const [minP, maxP] = mapPriceRange(selectedPrice);
      items = items.filter((p) => {
        const price = Number(p.price || 0);
        return price >= minP && price <= maxP;
      });
    }

    // ✅ Price min/max manual
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price || 0) <= max);
    }

    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // 3) SORTING
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
    qNorm,
    selectedBrands,
    selectedColors,
    selectedFabric,
    selectedSizes,
    selectedPrice,
    priceMin,
    priceMax,
    inStockOnly,
    sorting,
  ]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Searching products...</h2>
      </div>
    );
  }

  return (
    <div className="women-page">
      {/* ✅ header */}
      <div
        style={{
          background: '#f8f8f8',
          padding: '2rem 1rem',
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1>Search Results</h1>
        <p style={{ marginTop: 6 }}>
          Showing results for: <strong>"{query}"</strong>
        </p>

        {/* optional quick clear */}
        {query ? (
          <button
            type="button"
            style={{
              marginTop: 10,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/search?q=', { replace: true })}
          >
            Clear Search
          </button>
        ) : null}
      </div>

      <div className="women-main">
        {/* ✅ SIDEBAR (reused) */}
        <FiltersSidebar
          // sorting
          sorting={sorting}
          setSorting={setSorting}
          // delivery + stock
          delivery={delivery}
          setDelivery={setDelivery}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          // price
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          // filters
          selectedFabric={selectedFabric}
          setSelectedFabric={setSelectedFabric}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          // context props to avoid sidebar hiding things
          isUnstitchedRoute={false}
          unstitchedType={null}
          isUnstitchedPath={false}
          hideBrandFilter={false}
          // clear
          onClearFilters={resetAllFilters}
        />

        {/* ✅ RESULTS GRID */}
        <section className="women-products">
          <div className="products-top-row">
            <div>
              <div className="products-count">
                Found {filteredProducts.length} result
                {filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="men-subline" style={{ marginTop: 6 }}>
                Search • {query ? `"${query}"` : 'No query'}
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

          {filteredProducts.length === 0 ? (
            <div
              className="no-results"
              style={{ padding: '3rem', textAlign: 'center' }}
            >
              <h3>No results found</h3>
              <p style={{ marginTop: 6 }}>
                Try tags like: <strong>winter</strong>, <strong>printed</strong>
                , <strong>unstitched</strong>,<strong> ready to wear</strong>,
                or a color like <strong>black</strong>.
              </p>
            </div>
          ) : (
            <div className={`products-grid products-grid-${gridType}`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  // ✅ so breadcrumbs can show full flow when opened from search
                  fromOverride={{
                    pathname: location.pathname,
                    search: location.search,
                    label: 'Search',
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
