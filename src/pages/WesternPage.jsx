// src/pages/WesternPage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Banner from '../components/women/Banner';
import FiltersSidebar from '../components/women/FiltersSidebar';
import ProductCard from '../components/women/ProductCard';
// import allProducts from '../data/AllProducts'; // Removed static import
import { useProducts } from '../context/ProductContext'; // Import context
import WesternTypeHeader from '../components/women/WesternTypeHeader';
import './WomenPage.css';

export default function WesternPage() {
  const { products: allProducts, loading } = useProducts(); // Use context
  const [searchParams] = useSearchParams();
  const urlType = (searchParams.get('type') || '').toUpperCase();

  // ---------- STATE ----------
  const [sorting, setSorting] = useState('popularity');
  const [delivery, setDelivery] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [gridType, setGridType] = useState('four');

  const bannerKey = 'western-main';

  const mapPriceRange = (label) => {
    switch (label) {
      case 'Below PKR 5000':
        return [0, 5000];
      case 'PKR 5000 - PKR 10,000':
        return [5000, 10000];
      case 'PKR 10,000 - PKR 15,000':
        return [10000, 15000];
      case 'PKR 15,000 - PKR 20,000':
        return [15000, 20000];
      case 'PKR 20,000 - PKR 30,000':
        return [20000, 30000];
      case 'Above PKR 30,000':
        return [30000, Infinity];
      default:
        return [0, Infinity];
    }
  };

  const filteredProducts = useMemo(() => {
    let items = allProducts.filter(
      (p) => (p.mainCategory || '').toUpperCase() === 'WESTERN'
    );

    if (urlType) {
      items = items.filter(
        (p) => (p.westernType || '').toUpperCase() === urlType
      );
    }

    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    if (selectedFabric.length > 0) {
      items = items.filter((p) => selectedFabric.includes(p.fabric));
    }

    if (selectedSizes.length > 0) {
      items = items.filter((p) => selectedSizes.includes(p.size));
    }

    if (selectedPrice) {
      const [min, max] = mapPriceRange(selectedPrice);
      items = items.filter((p) => p.price >= min && p.price <= max);
    }

    if (inStockOnly) {
      items = items.filter((p) => p.inStock);
    }

    items.sort((a, b) => {
      if (sorting === 'lowhigh') return a.price - b.price;
      if (sorting === 'highlow') return b.price - a.price;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return items;
  }, [
    urlType,
    selectedBrands,
    selectedColors,
    selectedFabric,
    selectedSizes,
    selectedPrice,
    inStockOnly,
    sorting,
  ]);

  const activeBrand = selectedBrands.length === 1 ? selectedBrands[0] : null;

  if (loading) {
    return <div className="women-page" style={{ padding: '2rem', textAlign: 'center' }}><h2>Loading western wear...</h2></div>;
  }

  return (
    <div className="women-page">
      <Banner currentTag={bannerKey} />

      <WesternTypeHeader
        activeType={urlType}
        onTypeChange={(typeKey) => {
          // when user clicks on a circle, change URL
          const lower = typeKey.toLowerCase().replace(' ', '-');
          window.location.search = `?type=${lower}`;
        }}
      />

      <div className="women-main">
        <FiltersSidebar
          sorting={sorting}
          setSorting={setSorting}
          delivery={delivery}
          setDelivery={setDelivery}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          selectedFabric={selectedFabric}
          setSelectedFabric={setSelectedFabric}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          isUnstitchedRoute={false}
          unstitchedType={null}
        />

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
