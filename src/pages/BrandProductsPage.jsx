// src/pages/BrandProductsPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

// import all your product data
import womenProducts from '../data/WomenProducts';
import readyProducts from '../data/ReadyToWearProducts';

import accessories from '../data/AccessoriesProducts';

// Reuse your existing ProductCard component if you want same card style
import ProductCard from '../components/women/ProductCard';

const allProducts = [...womenProducts, ...readyProducts, ...accessories];

export default function BrandProductsPage() {
  const { brandName } = useParams();

  const brandProducts = allProducts.filter(
    (p) =>
      p.brand &&
      p.brand.toLowerCase().replace(/\s+/g, '') ===
        brandName.toLowerCase().replace(/\s+/g, '')
  );

  return (
    <div
      className="brand-products-page"
      style={{ padding: '30px 6%', marginTop: '80px' }}
    >
      <h1 style={{ marginBottom: '20px', fontSize: '1.8rem' }}>
        Products by <span style={{ color: '#1f4632' }}>{brandName}</span>
      </h1>

      {brandProducts.length === 0 ? (
        <p>No products found for this brand yet.</p>
      ) : (
        <div
          className="brand-products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
