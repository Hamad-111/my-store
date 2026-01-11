// src/components/accessories/AccessoriesFiltersSidebar.jsx
import React, { useMemo } from 'react';
import {
  FaSort,
  FaCheckCircle,
  FaRupeeSign,
  FaPalette,
  FaTags,
  FaBroom,
  FaTshirt,
} from 'react-icons/fa';
import '../../pages/WomenPage.css';

export default function AccessoriesFiltersSidebar({
  mainCategory, // 'JEWELLRY' | 'SHAWLS' | 'HAIR ACCESSORIES' | null

  sorting,
  setSorting,
  inStockOnly,
  setInStockOnly,

  priceMin = '',
  setPriceMin,
  priceMax = '',
  setPriceMax,

  selectedBrands = [],
  setSelectedBrands,

  selectedColors = [],
  setSelectedColors,

  selectedMaterials = [],
  setSelectedMaterials,

  onClearFilters,
}) {
  const colors = useMemo(
    () => [
      'Black',
      'White',
      'Red',
      'Pink',
      'Blue',
      'Green',
      'Gold',
      'Silver',
      'Maroon',
      'Beige',
    ],
    []
  );

  const brandOptions = useMemo(() => ['Alkaram', 'Khaadi', 'Sapphire'], []);

  const MATERIAL_MAP = useMemo(
    () => ({
      JEWELLRY: [
        'Gold',
        'Silver',
        'Rose Gold',
        'Stainless Steel',
        'Alloy',
        '925 Silver',
        'Metal',
      ],
      SHAWLS: ['Pashmina', 'Wool', 'Cotton', 'Chiffon', 'Acrylic'],
      'HAIR ACCESSORIES': ['Plastic', 'Metal', 'Fabric', 'Satin'],
    }),
    []
  );

  const materialsToShow = useMemo(() => {
    if (!mainCategory) {
      const all = Object.values(MATERIAL_MAP).flat();
      return Array.from(new Set(all));
    }
    return MATERIAL_MAP[mainCategory] || [];
  }, [mainCategory, MATERIAL_MAP]);

  const toggleSingle = (value, list, setList) => {
    if (list.includes(value)) setList([]);
    else setList([value]);
  };

  const hasAnyFilter =
    priceMin !== '' ||
    priceMax !== '' ||
    selectedBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedMaterials.length > 0 ||
    Boolean(inStockOnly) ||
    sorting !== 'popularity';

  return (
    <div className="filters-sidebar">
      <button
        type="button"
        className="filter-clear-btn"
        disabled={!hasAnyFilter}
        onClick={() => onClearFilters && onClearFilters()}
      >
        <FaBroom /> Clear Filters
      </button>

      {/* SORT */}
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

      {/* STOCK */}
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
          <FaRupeeSign className="icon rupee" /> Price
        </h3>
        <div className="price-range-row">
          <input
            type="number"
            placeholder="From"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="price-input"
            min="0"
          />
          <span className="price-dash">—</span>
          <input
            type="number"
            placeholder="To"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>

      {/* MATERIAL */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon fabric" /> Material
        </h3>
        <div className="scroll-filter-list">
          {materialsToShow.map((m) => (
            <label key={m} className="filter-item">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(m)}
                onChange={() =>
                  toggleSingle(m, selectedMaterials, setSelectedMaterials)
                }
              />
              {m}
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
        <div className="brand-list-filter">
          {brandOptions.map((b) => (
            <label key={b} className="brand-item-filter">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() =>
                  toggleSingle(b, selectedBrands, setSelectedBrands)
                }
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
