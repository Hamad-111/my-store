// src/pages/BrandPage.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './BrandPage.css';

import {
  WOMEN_BRANDS,
  RTW_BRANDS,
  MEN_BRANDS,
  ACCESSORIES_BRANDS_COMMON,
  ACCESSORIES_BRANDS_JEWELLERY,
  BRAND_LOGOS,
} from '../constants/brandOptions';

export default function BrandPage() {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('#');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  const letters = [
    '#',
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ];

  // ✅ brand list with logo + categories
  const allBrands = useMemo(() => {
    const accessories = Array.from(
      new Set([...ACCESSORIES_BRANDS_COMMON, ...ACCESSORIES_BRANDS_JEWELLERY])
    );

    const map = new Map();

    const add = (name, cat) => {
      if (!name) return;
      const key = String(name).trim();
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          name: key,
          category: new Set([cat]),
          logo: BRAND_LOGOS?.[key] || null, // ✅ logo from mapping
        });
      } else {
        map.get(key).category.add(cat);
        // if logo missing but now exists
        if (!map.get(key).logo && BRAND_LOGOS?.[key]) {
          map.get(key).logo = BRAND_LOGOS[key];
        }
      }
    };

    // Women tab includes women + RTW
    WOMEN_BRANDS.forEach((b) => add(b, 'women'));
    RTW_BRANDS.forEach((b) => add(b, 'women'));

    // Men
    MEN_BRANDS.forEach((b) => add(b, 'men'));

    // Accessories
    accessories.forEach((b) => add(b, 'accessories'));

    return Array.from(map.values())
      .map((x) => ({ ...x, category: Array.from(x.category) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === 'all' ? true : b.category.includes(category);
      const matchesLetter =
        selectedLetter === '#'
          ? true
          : b.name.toUpperCase().startsWith(selectedLetter);

      return matchesSearch && matchesCategory && matchesLetter;
    });
  }, [allBrands, search, category, selectedLetter]);

  const handleBrandClick = (brandName) => {
    // ✅ You can later change routing: men brands -> /men?brand=
    navigate(`/women?brand=${encodeURIComponent(brandName)}`);
  };

  return (
    <div className="brand-page">
      <h1 className="brand-main-title">BRANDS</h1>

      <div className="brand-search-wrapper">
        <FaSearch className="brand-search-icon" />
        <input
          type="text"
          placeholder="Search brand..."
          className="brand-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="brand-categories">
        <button
          className={category === 'all' ? 'active' : ''}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        <button
          className={category === 'women' ? 'active' : ''}
          onClick={() => setCategory('women')}
        >
          Women
        </button>
        <button
          className={category === 'men' ? 'active' : ''}
          onClick={() => setCategory('men')}
        >
          Men
        </button>
        <button
          className={category === 'accessories' ? 'active' : ''}
          onClick={() => setCategory('accessories')}
        >
          Accessories
        </button>
      </div>

      <div className="brand-letters">
        {letters.map((letter) => (
          <button
            key={letter}
            className={selectedLetter === letter ? 'active' : ''}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="brand-list">
        {filteredBrands.length === 0 ? (
          <p className="no-result">No brands found.</p>
        ) : (
          filteredBrands.map((brand) => (
            <button
              key={brand.name}
              className="brand-box"
              onClick={() => handleBrandClick(brand.name)}
            >
              {/* ✅ logo show, else fallback */}
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="brand-logo" />
              ) : (
                <div className="brand-logo-fallback">{brand.name[0]}</div>
              )}
              <span>{brand.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
