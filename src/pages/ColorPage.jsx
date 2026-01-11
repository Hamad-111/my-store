// src/pages/ColorPage.jsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ProductCard from '../components/women/ProductCard.jsx';
import ColorFiltersSidebar from '../components/color/ColorFiltersSidebar.jsx';
import { useProducts } from '../context/ProductContext';

import './WomenPage.css';

export default function ColorPage() {
  const { products: allProducts = [], loading } = useProducts();
  const { colorId } = useParams(); // red | green | black

  // ---------- FILTER STATES ----------
  const [sorting, setSorting] = useState('popularity');
  const [delivery, setDelivery] = useState(null); // 'express' | null
  const [inStockOnly, setInStockOnly] = useState(false);

  // ✅ price From — To
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // ✅ only these filters
  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [gridType, setGridType] = useState('four'); // two | four | six

  const resetAllFilters = () => {
    setSorting('popularity');
    setDelivery(null);
    setInStockOnly(false);

    setPriceMin('');
    setPriceMax('');

    setSelectedFabric([]);
    setSelectedBrands([]);

    setGridType('four');
  };

  // ✅ Only Women Unstitched + RTW (NO accessories) AND color match
  const colorProducts = useMemo(() => {
    const cid = (colorId || '').toLowerCase().trim();

    return allProducts.filter((p) => {
      const pColor = (p.color || '').toLowerCase().trim();
      const main = (p.mainCategory || '').toUpperCase();

      const allowed = main === 'UNSTITCHED' || main === 'READY_TO_WEAR';
      return allowed && pColor === cid;
    });
  }, [colorId, allProducts]);

  // ✅ brands options from filtered list only
  const availableBrands = useMemo(() => {
    return Array.from(
      new Set(colorProducts.map((p) => p.brand).filter(Boolean))
    ).sort();
  }, [colorProducts]);

  // ✅ smooth scroll like women/rtw (optional)
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
    selectedBrands,
    gridType,
    colorId,
  ]);

  const filteredProducts = useMemo(() => {
    let items = [...colorProducts];

    // brand
    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    // fabric
    if (selectedFabric.length > 0) {
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    }

    // express
    if (delivery === 'express') {
      items = items.filter((p) => p.express === true);
    }

    // stock
    if (inStockOnly) {
      items = items.filter((p) => p.inStock === true);
    }

    // price From — To
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price || 0) <= max);
    }

    // sort
    items.sort((a, b) => {
      if (sorting === 'lowhigh')
        return Number(a.price || 0) - Number(b.price || 0);
      if (sorting === 'highlow')
        return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    return items;
  }, [
    colorProducts,
    selectedBrands,
    selectedFabric,
    delivery,
    inStockOnly,
    priceMin,
    priceMax,
    sorting,
  ]);

  const titleColor =
    (colorId || '').charAt(0).toUpperCase() + (colorId || '').slice(1);

  const activeBrand = selectedBrands.length === 1 ? selectedBrands[0] : null;

  if (loading) {
    return (
      <div
        className="women-page"
        style={{ padding: '2rem', textAlign: 'center' }}
      >
        <h2>Loading color collection...</h2>
      </div>
    );
  }

  return (
    <div className="women-page">
      {/* Heading */}
      <div className="u-type-wrapper u-type-wrapper-small">
        <h2 className="u-type-title u-type-title-small">
          SHOP BY COLOR – {titleColor}
        </h2>
      </div>

      <div className="women-main">
        {/* SIDEBAR */}
        <ColorFiltersSidebar
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
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          availableBrands={availableBrands}
          onClearFilters={resetAllFilters}
        />

        {/* PRODUCTS */}
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
