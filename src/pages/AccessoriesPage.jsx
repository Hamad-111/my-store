// src/pages/AccessoriesPage.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import AccessoriesBanner from '../components/accessories/AccessoriesBanner';
import AccessoriesTypeHeader from '../components/accessories/AccessoriesTypeHeader';
import AccessoriesFiltersSidebar from '../components/accessories/AccessoriesFiltersSidebar';
import AccessoryProductCard from '../components/accessories/AccessoryProductCard';
import { useProducts } from '../context/ProductContext';

import './WomenPage.css';

// ✅ ONLY these categories (bags/footwear/watches removed)
const ACCESSORY_CATEGORIES = ['JEWELLRY', 'SHAWLS', 'HAIR ACCESSORIES'];

export default function AccessoriesPage() {
  const { products = [], loading } = useProducts();
  const [searchParams] = useSearchParams();

  // ✅ Keep urlCat as-is (don’t convert hyphen to space)
  const urlCat = (searchParams.get('cat') || '').toLowerCase().trim();

  // ✅ category mapping fixed (hair-accessories works now)
  const mainCategory =
    urlCat === 'jewellery'
      ? 'JEWELLRY'
      : urlCat === 'shawls'
      ? 'SHAWLS'
      : urlCat === 'sunglasses'
      ? 'SUNGLASSES'
      : urlCat === 'scarves'
      ? 'SCARVES'
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
  const [gridType, setGridType] = useState('four');

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
    setGridType('four');
  }, []);

  const bannerKey = urlCat || 'accessories';

  const filteredProducts = useMemo(() => {
    // only accessories (limited)
    let items = products.filter((p) =>
      ACCESSORY_CATEGORIES.includes(p.mainCategory)
    );

    // category filter (if any)
    if (mainCategory) {
      items = items.filter((p) => (p.mainCategory || '') === mainCategory);
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

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => (p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => (p.price || 0) <= max);
    }

    // stock
    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    // sorting
    items.sort((a, b) => {
      if (sorting === 'lowhigh') return (a.price || 0) - (b.price || 0);
      if (sorting === 'highlow') return (b.price || 0) - (a.price || 0);
      return (b.popularity || 0) - (a.popularity || 0);
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
        onSubCategoryChange={setActiveSubCategory}
      />

      <div className="women-main">
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

        <section className="women-products">
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
