// src/pages/ComparePage.jsx
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import products from '../data/WomenProducts.jsx';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ComparePage.css';

export default function ComparePage() {
  const location = useLocation();
  const { addToCart } = useCart();

  const baseProduct = location.state?.baseProduct || products[0] || null;

  // three compare slots
  const [slots, setSlots] = useState([null, null, null]);

  // filters per slot (Brand, PriceRange, Color)
  const [slotFilters, setSlotFilters] = useState([
    { brand: '', priceRange: '', color: '' },
    { brand: '', priceRange: '', color: '' },
    { brand: '', priceRange: '', color: '' },
  ]);

  // All candidates exclude base product
  const compareCandidates = useMemo(
    () => products.filter((p) => p.id !== (baseProduct?.id ?? '')),
    [baseProduct]
  );

  // ===== FILTER OPTIONS (match your FilterSidebar logic) =====
  const priceRanges = [
    'Below Rs 5000',
    'Rs 5000 - Rs 10,000',
    'Rs 10,000 - Rs 15,000',
    'Rs 15,000 - Rs 20,000',
    'Rs 20,000 - Rs 30,000',
    'Above Rs 30,000',
  ];

  // For compare page I’ll build brands & colors from data (so everything actually works)
  const allBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set);
  }, []);

  const allColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.color && set.add(p.color));
    return Array.from(set);
  }, []);

  // ===== FILTER HELPERS =====
  const handleFilterChange = (slotIndex, field, value) => {
    setSlotFilters((prev) => {
      const copy = [...prev];
      copy[slotIndex] = {
        ...copy[slotIndex],
        [field]: value,
      };
      return copy;
    });
  };

  const matchesPriceRange = (price, range) => {
    if (!range) return true;
    if (price == null) return false;

    switch (range) {
      case 'Below Rs 5000':
        return price < 5000;
      case 'Rs 5000 - Rs 10,000':
        return price >= 5000 && price <= 10000;
      case 'Rs 10,000 - Rs 15,000':
        return price > 10000 && price <= 15000;
      case 'Rs 15,000 - Rs 20,000':
        return price > 15000 && price <= 20000;
      case 'Rs 20,000 - Rs 30,000':
        return price > 20000 && price <= 30000;
      case 'Above Rs 30,000':
        return price > 30000;
      default:
        return true;
    }
  };

  // suggestions for each slot based only on filters
  const getSuggestions = (index) => {
    const chosenIds = slots.map((s) => s?.id).filter(Boolean);
    const filters = slotFilters[index];

    return compareCandidates
      .filter((p) => !chosenIds.includes(p.id))
      .filter((p) => {
        // brand filter
        if (filters.brand && p.brand !== filters.brand) return false;
        // color filter
        if (filters.color && p.color !== filters.color) return false;
        // price filter
        if (!matchesPriceRange(p.price, filters.priceRange)) return false;

        return true;
      })
      .slice(0, 6);
  };

  const handleSelectSuggestion = (index, productId) => {
    const found = compareCandidates.find((p) => p.id === productId);
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = found || null;
      return copy;
    });
  };

  const removeSlot = (index) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });

    // also reset filters for that slot
    setSlotFilters((prev) => {
      const copy = [...prev];
      copy[index] = { brand: '', priceRange: '', color: '' };
      return copy;
    });
  };

  // utility for price display: old price and percent-off
  const getOffer = (p) => {
    if (!p) return null;
    const oldPrice = p.originalPrice || Math.round((p.price || 0) * 1.12);
    const percent =
      oldPrice && p.price
        ? Math.round(((oldPrice - p.price) / oldPrice) * 100)
        : 0;
    return { oldPrice, percent };
  };

  // for features table
  const features = [
    'Price',
    'Brand',
    'Fabric',
    'Color',
    'Pieces',
    'Unstitched Type',
    'Style',
  ];

  const getFeatureValue = (p, feature) => {
    if (!p) return '-';
    switch (feature) {
      case 'Price':
        return p.price != null ? `Rs. ${p.price}` : '-';
      case 'Brand':
        return p.brand || '-';
      case 'Fabric':
        return p.fabric || '-';
      case 'Color':
        return p.color || '-';
      case 'Pieces':
        return p.pieces || '-';
      case 'Unstitched Type':
        return p.unstitchedType || '-';
      case 'Style':
        return p.style || '-';
      default:
        return '-';
    }
  };

  return (
    <div className="compare-page">
      <div className="compare-main">
        {/* LEFT: Base product summary */}
        <div className="compare-left-col">
          <div className="comparison-card base-card">
            <div className="compare-title">Comparison of</div>
            <h3 className="base-name">
              {baseProduct?.title || baseProduct?.name || 'No product selected'}
            </h3>

            <img
              src={baseProduct?.image || baseProduct?.images?.[0]}
              alt={baseProduct?.title || baseProduct?.name}
              className="compare-image"
            />
            {baseProduct?.brand && (
              <div className="base-brand">{baseProduct.brand}</div>
            )}
            <div className="price-row">
              <div className="compare-price">
                Rs. {baseProduct?.price ?? '-'}
              </div>
              {baseProduct && getOffer(baseProduct) && (
                <div className="compare-old-tag">
                  <span className="old-price">
                    Rs. {getOffer(baseProduct).oldPrice}
                  </span>
                  <span className="tag-off">
                    {getOffer(baseProduct).percent}% OFF
                  </span>
                </div>
              )}
            </div>

            <button
              className="btn-add"
              onClick={() => baseProduct && addToCart(baseProduct)}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* RIGHT: compare slots */}
        <div className="compare-right-col">
          <div className="compare-slots-row">
            {[0, 1, 2].map((i) => (
              <div key={i} className="compare-slot">
                {/* 🔹 NEW inner card wrapper */}
                <div className="slot-inner">
                  <div className="slot-header">
                    <button
                      className="slot-remove"
                      onClick={() => removeSlot(i)}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* EMPTY SLOT: filters + suggestions INSIDE CARD */}
                  {!slots[i] && (
                    <>
                      <div className="slot-label">
                        <div className="compare-with">Compare with</div>
                        <div className="compare-guidance"></div>
                      </div>

                      {/* Horizontal filters row (inside card) */}
                      <div className="slot-filters-row">
                        {/* Brand */}
                        <div className="slot-filter">
                          <label>Brand</label>
                          <select
                            value={slotFilters[i].brand}
                            onChange={(e) =>
                              handleFilterChange(i, 'brand', e.target.value)
                            }
                          >
                            <option value="">All</option>
                            {allBrands.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price */}
                        <div className="slot-filter">
                          <label>Price</label>
                          <select
                            value={slotFilters[i].priceRange}
                            onChange={(e) =>
                              handleFilterChange(
                                i,
                                'priceRange',
                                e.target.value
                              )
                            }
                          >
                            <option value="">All</option>
                            {priceRanges.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Color */}
                        <div className="slot-filter">
                          <label>Color</label>
                          <select
                            value={slotFilters[i].color}
                            onChange={(e) =>
                              handleFilterChange(i, 'color', e.target.value)
                            }
                          >
                            <option value="">All</option>
                            {allColors.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 👉 Suggestions ONLY after some filter selected */}
                      {!(
                        slotFilters[i].brand ||
                        slotFilters[i].priceRange ||
                        slotFilters[i].color
                      ) ? (
                        <div className="suggestion-hint">
                          Select at least one filter above to see products.
                        </div>
                      ) : (
                        <ul className="suggestions-list compare-suggestions">
                          {getSuggestions(i).length === 0 ? (
                            <li className="suggestion-empty">
                              No products match these filters
                            </li>
                          ) : (
                            getSuggestions(i).map((s) => (
                              <li
                                key={s.id}
                                className="suggestion-item"
                                onClick={() => handleSelectSuggestion(i, s.id)}
                              >
                                <img
                                  src={s.image || s.images?.[0]}
                                  alt={s.title || s.name}
                                />
                                <div className="sugg-meta">
                                  <div className="sugg-brand">{s.brand}</div>
                                  <div className="sugg-name">
                                    {s.title || s.name}
                                  </div>
                                  <div className="sugg-sub">
                                    Rs. {s.price}{' '}
                                    {s.fabric && <>• {s.fabric}</>}
                                  </div>
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </>
                  )}

                  {/* FILLED SLOT: product card INSIDE same white box */}
                  {slots[i] && (
                    <div className="slot-card">
                      <div className="slot-name">
                        {slots[i].title || slots[i].name}
                      </div>

                      <img
                        src={slots[i].image || slots[i].images?.[0]}
                        alt={slots[i].title || slots[i].name}
                        className="slot-thumb"
                      />

                      {slots[i].brand && (
                        <div className="slot-brand">{slots[i].brand}</div>
                      )}

                      <div className="slot-price">Rs. {slots[i].price}</div>

                      <button
                        className="btn-add small"
                        onClick={() => addToCart(slots[i])}
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* features table (below slots) */}
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>{baseProduct?.title || baseProduct?.name || 'Base'}</th>
                  {slots.map((s, idx) => (
                    <th key={idx}>
                      {s ? s.title || s.name : `Slot ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {features.map((feature) => (
                  <tr key={feature}>
                    <td className="feature-name">{feature}</td>
                    <td>{getFeatureValue(baseProduct, feature)}</td>
                    {slots.map((s, idx) => (
                      <td key={idx}>{getFeatureValue(s, feature)}</td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td className="feature-name">Short Description</td>
                  <td>{baseProduct?.description || '-'}</td>
                  {slots.map((s, idx) => (
                    <td key={idx}>{s?.description ?? '-'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
