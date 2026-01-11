// src/components/readytowear/FiltersSidebarRTW.jsx
import React from 'react';
import {
  FaSort,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTshirt,
  FaPalette,
  FaTags,
  FaBroom,
} from 'react-icons/fa';
import '../../pages/WomenPage.css';

export default function FiltersSidebarRTW({
  sorting,
  setSorting,
  delivery,
  setDelivery,
  inStockOnly,
  setInStockOnly,

  // ✅ NEW: price inputs
  priceMin = '',
  setPriceMin,
  priceMax = '',
  setPriceMax,

  selectedFabric = [],
  setSelectedFabric,
  selectedSizes = [],
  setSelectedSizes,
  selectedColors = [],
  setSelectedColors,
  selectedBrands = [],
  setSelectedBrands,

  onClearFilters,
}) {
  const fabrics = [
    'Lawn',
    'Cotton',
    'Net',
    'Silk',
    'Chiffon',
    'Organza',
    'Crinkle',
    'Linen',
    'Khaddar',
    'Viscose',
    'Cambric',
    'Crepe',
    'Grip',
    'Velvet',
    'Karandi',
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colors = [
    'Black',
    'White',
    'Red',
    'Pink',
    'Blue',
    'Orange',
    'Green',
    'Yellow',
    'Purple',
  ];

  const brandOptions = [
    { name: 'Alkaram', logo: '/images/alkaram studio.png' },
    { name: 'Khaadi', logo: '/images/khaddii.png' },
    { name: 'Nishat', logo: '/images/nishat line.png' },
    { name: 'J.', logo: '/images/j..png' },
    { name: 'Sapphire', logo: '/images/sapphire.png' },
  ];

  const toggleMulti = (value, list, setList) => {
    setList(
      list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
    );
  };

  // ✅ single selects (like your previous RTW)
  const toggleBrandSingle = (value) => {
    if (selectedBrands.includes(value)) setSelectedBrands([]);
    else setSelectedBrands([value]);
  };
  const toggleFabricSingle = (value) => {
    if (selectedFabric.includes(value)) setSelectedFabric([]);
    else setSelectedFabric([value]);
  };
  const toggleSizeSingle = (value) => {
    if (selectedSizes.includes(value)) setSelectedSizes([]);
    else setSelectedSizes([value]);
  };

  const hasAnyFilter =
    priceMin !== '' ||
    priceMax !== '' ||
    selectedFabric.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedBrands.length > 0 ||
    Boolean(inStockOnly) ||
    sorting !== 'popularity';

  return (
    <div className="filters-sidebar">
      {/* ✅ CLEAR BUTTON */}
      <button
        type="button"
        className="filter-clear-btn"
        disabled={!hasAnyFilter}
        onClick={() => onClearFilters && onClearFilters()}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #ddd',
          background: hasAnyFilter ? '#fff' : '#f5f5f5',
          cursor: hasAnyFilter ? 'pointer' : 'not-allowed',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontWeight: 600,
        }}
      >
        <FaBroom />
        Clear Filters
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

      {/* ✅ PRICE (From — To) */}
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

        <div className="price-hint"></div>
      </div>

      {/* FABRIC (single select) */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon fabric" /> Fabric
        </h3>

        {fabrics.map((f) => (
          <label key={f} className="filter-item">
            <input
              type="checkbox"
              checked={selectedFabric.includes(f)}
              onChange={() => toggleFabricSingle(f)}
            />
            {f}
          </label>
        ))}
      </div>

      {/* SIZE (single select) */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon size" /> Size
        </h3>

        {sizes.map((s) => (
          <label key={s} className="filter-item">
            <input
              type="checkbox"
              checked={selectedSizes.includes(s)}
              onChange={() => toggleSizeSingle(s)}
            />
            {s}
          </label>
        ))}
      </div>

      {/* COLORS (single select circles) */}
      <div className="filter-box">
        <h3>
          <FaPalette className="icon palette" /> Colors
        </h3>

        <div className="color-box-grid">
          {colors.map((c) => {
            const isActive = selectedColors.includes(c);

            return (
              <button
                key={c}
                type="button"
                className={`color-circle ${isActive ? 'active' : ''}`}
                style={{ backgroundColor: c.toLowerCase() }}
                onClick={() => {
                  if (isActive) setSelectedColors([]);
                  else setSelectedColors([c]);
                }}
                title={c}
              />
            );
          })}
        </div>
      </div>

      {/* BRANDS (single select) */}
      <div className="filter-box">
        <h3>
          <FaTags className="icon brand" /> Brands
        </h3>

        <div className="brand-list-filter">
          {brandOptions.map((brand) => (
            <label key={brand.name} className="brand-item-filter">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleBrandSingle(brand.name)}
              />

              <img
                src={brand.logo}
                alt={brand.name}
                className="brand-logo-filter"
              />
              <span>{brand.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
