// src/components/color/ColorFiltersSidebar.jsx
import React from 'react';
import {
  FaSort,
  FaTruck,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTshirt,
  FaTags,
  FaBroom,
} from 'react-icons/fa';
import '../../pages/WomenPage.css';

export default function ColorFiltersSidebar({
  sorting,
  setSorting,
  delivery,
  setDelivery,
  inStockOnly,
  setInStockOnly,

  // price inputs
  priceMin = '',
  setPriceMin,
  priceMax = '',
  setPriceMax,

  selectedFabric = [],
  setSelectedFabric,

  selectedBrands = [],
  setSelectedBrands,

  onClearFilters,
}) {
  // ---------------- FABRIC LIST (RTW + Women) ----------------
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

  // ---------------- STATIC BRAND OPTIONS (RTW + Women) ----------------
  const brandOptions = [
    'Alkaram',
    'Khaadi',
    'Nishat',
    'J.',
    'Sapphire',
    'Satrangi',
    'Maria B',
    'SanaSafinaz',
    'GulAhmed',
  ];

  const toggleMulti = (value, list, setList) => {
    setList(
      list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
    );
  };

  // ✅ SINGLE SELECT BRAND
  const toggleBrandSingle = (value) => {
    if (selectedBrands.includes(value)) setSelectedBrands([]);
    else setSelectedBrands([value]);
  };

  const hasAnyFilter =
    priceMin !== '' ||
    priceMax !== '' ||
    selectedFabric.length > 0 ||
    selectedBrands.length > 0 ||
    Boolean(inStockOnly) ||
    sorting !== 'popularity' ||
    delivery !== null;

  return (
    <div className="filters-sidebar">
      {/* CLEAR FILTERS */}
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

      {/* DELIVERY */}
      <div className="filter-box">
        <h3>
          <FaTruck className="icon truck" /> Delivery
        </h3>
        <label className="filter-item">
          <input
            type="radio"
            checked={delivery === 'express'}
            onChange={() => setDelivery('express')}
          />
          Express Delivery
        </label>

        <label className="filter-item">
          <input
            type="radio"
            checked={delivery === null}
            onChange={() => setDelivery(null)}
          />
          Any Delivery
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
          Show only in-stock items
        </label>
      </div>

      {/* PRICE (From — To) */}
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

        <div className="price-hint">Example: 3000 — 10000</div>
      </div>

      {/* FABRIC */}
      <div className="filter-box">
        <h3>
          <FaTshirt className="icon fabric" /> Fabric
        </h3>

        <div className="men-scroll-list">
          {fabrics.map((f) => (
            <label key={f} className="filter-item">
              <input
                type="checkbox"
                checked={selectedFabric.includes(f)}
                onChange={() =>
                  toggleMulti(f, selectedFabric, setSelectedFabric)
                }
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      {/* BRANDS */}
      <div className="filter-box">
        <h3>
          <FaTags classClass="icon brand" /> Brands
        </h3>

        {brandOptions.map((b) => (
          <label key={b} className="filter-item">
            <input
              type="checkbox"
              checked={selectedBrands.includes(b)}
              onChange={() => toggleBrandSingle(b)}
            />
            {b}
          </label>
        ))}
      </div>
    </div>
  );
}
