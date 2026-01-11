// src/components/MostPopular.jsx
import React, { useMemo } from 'react';
import './MostPopular.css';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

const FALLBACK_BRAND_IMAGE = '/images/brandfallback.jfif';

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getDiscountPercent(p) {
  const sp = toNumber(p.salePercent);
  if (sp > 0) return sp;

  const op = toNumber(p.originalPrice);
  const price = toNumber(p.price);
  if (op > 0 && price > 0 && price < op) {
    return Math.round(((op - price) / op) * 100);
  }
  return 0;
}

function getAnyImage(p) {
  return (
    p?.image ||
    (Array.isArray(p?.images) && p.images.length > 0 ? p.images[0] : '') ||
    ''
  );
}

export default function MostPopular({ limit = 4 }) {
  const navigate = useNavigate();
  const { products = [], brands: brandsFromDb = [] } = useProducts();

  const popularBrands = useMemo(() => {
    const brandImageMap = new Map(
      (brandsFromDb || [])
        .filter((b) => b?.name)
        .map((b) => [
          String(b.name).trim().toLowerCase(),
          b.image || b.logo || '',
        ])
    );

    const map = new Map();

    products.forEach((p) => {
      const rawBrand = String(p.brand || '').trim();
      if (!rawBrand) return;

      const key = rawBrand.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: rawBrand,
          slug: rawBrand,
          items: 0,
          onSaleCount: 0,
          maxSalePercent: 0,
          // Sale score will decide top brands
          saleScore: 0,
          image: brandImageMap.get(key) || '',
          _firstProductImage: '',
        });
      }

      const row = map.get(key);
      row.items += 1;

      if (!row._firstProductImage) row._firstProductImage = getAnyImage(p);

      const salePct = getDiscountPercent(p);
      const isOnSale = Boolean(p.onSale) || salePct > 0;

      if (isOnSale) {
        row.onSaleCount += 1;
        if (salePct > row.maxSalePercent) row.maxSalePercent = salePct;

        // ✅ Sale score formula:
        // - count matters most (many sale items)
        // - higher discount adds extra weight
        row.saleScore += 10 + salePct; // you can tune this
      }
    });

    const arr = Array.from(map.values()).map((b) => ({
      ...b,
      image: b.image || b._firstProductImage || FALLBACK_BRAND_IMAGE,
      discountText:
        b.maxSalePercent > 0 ? `Up to ${b.maxSalePercent}% off` : '',
    }));

    // ✅ Sort by SALE SCORE first (most important)
    // If tie, show brand with more total items
    arr.sort((a, b) => {
      if (b.saleScore !== a.saleScore) return b.saleScore - a.saleScore;
      if (b.onSaleCount !== a.onSaleCount) return b.onSaleCount - a.onSaleCount;
      return b.items - a.items;
    });

    return arr.slice(0, limit);
  }, [products, brandsFromDb, limit]);

  const handleBrandClick = (brand) => {
    // ✅ go to brand page that shows ALL products of this brand
    navigate(`/brand/${encodeURIComponent(brand.slug)}`);
  };

  if (!popularBrands.length) return null;

  return (
    <div className="mp-container">
      <h2 className="mp-title">Top Brands on Sale</h2>

      <div className="mp-grid">
        {popularBrands.map((brand) => (
          <div
            className="mp-card"
            key={brand.key}
            onClick={() => handleBrandClick(brand)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBrandClick(brand)}
          >
            <div className="mp-img-wrapper">
              <img src={brand.image} alt={brand.name} className="mp-img" />
              {brand.maxSalePercent > 0 && (
                <span className="mp-discount">{brand.discountText}</span>
              )}
            </div>

            <h3 className="mp-name">{brand.name}</h3>

            <p className="mp-items">
              {brand.items} items
              {brand.onSaleCount > 0 ? (
                <span className="mp-saleCount">
                  {' '}
                  • {brand.onSaleCount} on sale
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
