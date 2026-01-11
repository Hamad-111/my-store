// src/components/men/MenFiltersSidebar.jsx
import React, { useMemo } from 'react';
import {
  FaSort,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTshirt,
  FaPalette,
  FaTags,
  FaBroom,
} from 'react-icons/fa';
import '../../pages/MenPage.css';

export default function MenFiltersSidebar({
  sorting,
  setSorting,
  inStockOnly,
  setInStockOnly,

  priceMin = '',
  setPriceMin,
  priceMax = '',
  setPriceMax,

  selectedFabrics = [],
  setSelectedFabrics,

  selectedSizes = [],
  setSelectedSizes,

  selectedColors = [],
  setSelectedColors,

  selectedBrands = [],
  setSelectedBrands,

  activeCategory = '', // '' | kurta | shalwar-kameez | shirts
  isRoot = false, // ✅ true when no category selected

  onClearFilters,
}) {
  // ✅ Brands (ONLY 5)
  const brandOptions = useMemo(() => ['J.', 'Nishat', 'AlKaram'], []);

  // ✅ Sizes: root pe bhi show (all)
  const sizeOptions = useMemo(() => ['S', 'M', 'L', 'XL', 'XXL'], []);

  // ✅ Fabrics map
  const FABRIC_MAP = useMemo(
    () => ({
      kurta: ['Cotton', 'Linen', 'Khaddar'],
      'shalwar-kameez': ['Wash & Wear', 'Cotton', 'Boski'],
      shirts: ['Cotton', 'Oxford', 'Linen'],
    }),
    []
  );

  // ✅ Colors map
  const COLOR_MAP = useMemo(
    () => ({
      shirts: ['Black', 'White', 'Navy', 'Grey', 'Yellow', 'Maroon'],
      kurta: ['White', 'Beige', 'Brown', 'Grey', 'Black'],
      'shalwar-kameez': [
        'White',
        'Cream',
        'Beige',
        'Grey',
        'Maroon',
        'Black',
        'Navy',
      ],
    }),
    []
  );

  // ✅ Root => all fabrics (unique)
  const fabrics = useMemo(() => {
    if (!activeCategory) {
      const all = Object.values(FABRIC_MAP).flat();
      return Array.from(new Set(all));
    }
    return FABRIC_MAP[activeCategory] || [];
  }, [activeCategory, FABRIC_MAP]);

  // ✅ Root => all colors (unique)
  const colors = useMemo(() => {
    if (!activeCategory) {
      const all = Object.values(COLOR_MAP).flat();
      return Array.from(new Set(all));
    }
    return COLOR_MAP[activeCategory] || [];
  }, [activeCategory, COLOR_MAP]);

  const toggleMulti = (value, list, setList) => {
    setList(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
  };

  const hasAnyFilter =
    priceMin !== '' ||
    priceMax !== '' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedBrands.length > 0 ||
    selectedFabrics.length > 0 ||
    Boolean(inStockOnly) ||
    sorting !== 'popularity';

  return (
    <div className="filters-sidebar men-filters">
      <button
        type="button"
        className="filter-clear-btn"
        disabled={!hasAnyFilter}
        onClick={() => onClearFilters && onClearFilters()}
      >
        <FaBroom /> Clear Filters
      </button>

      {/* SORTING */}
      <div className="filter-box">
        <h3>
          <FaSort className="icon sort" /> Sorting
        </h3>

        <label className="filter-item">
          <input
            type="radio"
            checked={sorting === 'popularity'}
            onChange={() => setSorting('popularity')}
          />
          Popularity
        </label>

        <label className="filter-item">
          <input
            type="radio"
            checked={sorting === 'highlow'}
            onChange={() => setSorting('highlow')}
          />
          Price (High to Low)
        </label>

        <label className="filter-item">
          <input
            type="radio"
            checked={sorting === 'lowhigh'}
            onChange={() => setSorting('lowhigh')}
          />
          Price (Low to High)
        </label>
      </div>

      {/* IN STOCK */}
      <div className="filter-box">
        <h3>
          <FaCheckCircle className="icon check" /> In Stock
        </h3>

        <label className="filter-item">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
          />
          In Stock
        </label>
      </div>

      {/* PRICE */}
      <div className="filter-box">
        <h3>
          <FaMoneyBillWave className="icon rupee" /> Set Your Price Range
        </h3>

        <div className="price-range-row">
          <input
            type="number"
            className="price-input"
            placeholder="From"
            min="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <span className="price-dash">—</span>
          <input
            type="number"
            className="price-input"
            placeholder="To"
            min="0"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ SIZE: root pe bhi show */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon size" /> Size
        </h3>

        {sizeOptions.map((s) => (
          <label key={s} className="filter-item">
            <input
              type="checkbox"
              checked={selectedSizes.includes(s)}
              onChange={() => toggleMulti(s, selectedSizes, setSelectedSizes)}
            />
            {s}
          </label>
        ))}
      </div>

      {/* FABRICS */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon fabric" /> Fabrics
        </h3>

        <div className="men-scroll-list">
          {fabrics.map((f) => (
            <label key={f} className="filter-item">
              <input
                type="checkbox"
                checked={selectedFabrics.includes(f)}
                onChange={() =>
                  toggleMulti(f, selectedFabrics, setSelectedFabrics)
                }
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      {/* COLORS */}
      <div className="filter-box">
        <h3>
          <FaPalette className="icon palette" /> Colors
        </h3>

        <div className="color-box-grid">
          {colors.map((c) => {
            const active = selectedColors.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={`color-circle ${active ? 'active' : ''}`}
                style={{ backgroundColor: c.toLowerCase() }}
                onClick={() =>
                  active ? setSelectedColors([]) : setSelectedColors([c])
                }
                title={c}
              />
            );
          })}
        </div>
      </div>

      {/* BRANDS */}
      <div className="filter-box">
        <h3>
          <FaTags className="icon brand" /> Brands
        </h3>

        <div className="men-brand-list">
          {brandOptions.map((b) => (
            <label key={b} className="filter-item">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() =>
                  toggleMulti(b, selectedBrands, setSelectedBrands)
                }
              />
              {b}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
