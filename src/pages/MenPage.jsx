// ✅ src/pages/MenPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import MenBanner from '../components/men/MenBanner';
import MenFiltersSidebar from '../components/men/MenFiltersSidebar';
import MenTypeHeader from '../components/men/MenTypeHeader';

import ProductCard from '../components/women/ProductCard';
import { useProducts } from '../context/ProductContext';

import './MenPage.css';

export default function MenPage() {
  const { products: allProducts = [], loading } = useProducts();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const sectionQ = (searchParams.get('section') || '').toLowerCase(); // '' | menswear
  const urlCategory = (searchParams.get('category') || '').toLowerCase(); // kurta | shalwar-kameez | shirts

  const isMenPath = location.pathname === '/men';
  const isRoot = isMenPath && !sectionQ;

  const MEN_CATEGORIES = [
    { key: 'kurta', label: 'Kurta', image: '/images/menkurti2.jfif' },
    {
      key: 'shalwar-kameez',
      label: 'Shalwar Kameez',
      image: '/images/menunstitched1.jfif',
    },
    { key: 'shirts', label: 'Shirts', image: '/images/menshirt1.jfif' },
  ];

  // filters state
  const [sorting, setSorting] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [gridType, setGridType] = useState('four');

  const resetAllFilters = () => {
    setSorting('popularity');
    setInStockOnly(false);
    setPriceMin('');
    setPriceMax('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setSelectedFabrics([]);
    setGridType('four');
  };

  useEffect(() => {
    resetAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  const onChangeCategory = (categoryKey) => {
    navigate(`/men?section=menswear&category=${categoryKey}`);
  };

  const filteredProducts = useMemo(() => {
    // ✅ 1) STRICT: only menswear items
    // Best rule: mainCategory === MENSWEAR OR section === menswear
    let items = (allProducts || []).filter((p) => {
      const mc = String(p.mainCategory || '')
        .toUpperCase()
        .trim();
      const sec = String(p.section || '')
        .toLowerCase()
        .trim();
      const cat = String(p.category || '')
        .toLowerCase()
        .trim();

      // ✅ STRICT men products only
      return mc === 'MENSWEAR' && sec === 'menswear' && cat === 'men';
    });
    items = Array.from(new Map(items.map((p) => [String(p.id), p])).values());

    // ✅ 2) Remove duplicates by id (fixes 12 showing because merged twice)
    items = Array.from(new Map(items.map((p) => [String(p.id), p])).values());

    // ✅ 3) Category filter (kurta / shalwar-kameez / shirts)
    if (urlCategory) {
      items = items.filter((p) => {
        const sub = String(p.subCategory || '')
          .toLowerCase()
          .trim();
        const norm = sub.replace(/\s+/g, '-');
        return norm === urlCategory;
      });
    }

    // ✅ 4) Sidebar filters
    if (selectedColors.length > 0) {
      items = items.filter((p) => selectedColors.includes(p.color));
    }

    if (selectedSizes.length > 0) {
      items = items.filter((p) => selectedSizes.includes(p.size));
    }

    if (selectedBrands.length > 0) {
      items = items.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedFabrics.length > 0) {
      items = items.filter((p) => {
        const v = String(p.fabric || p.material || '').trim();
        return selectedFabrics.includes(v);
      });
    }

    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => Number(p.price || 0) >= min);
    }

    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => Number(p.price || 0) <= max);
    }

    if (inStockOnly) {
      items = items.filter((p) => p.inStock === true);
    }

    // ✅ 5) Sorting
    items.sort((a, b) => {
      if (sorting === 'lowhigh')
        return Number(a.price || 0) - Number(b.price || 0);
      if (sorting === 'highlow')
        return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.popularity || 0) - Number(a.popularity || 0);
    });

    return items;
  }, [
    allProducts,
    urlCategory,
    selectedColors,
    selectedSizes,
    selectedBrands,
    selectedFabrics,
    priceMin,
    priceMax,
    inStockOnly,
    sorting,
  ]);

  const bannerKey = isRoot
    ? 'men-root'
    : urlCategory
    ? `men-menswear-${urlCategory}`
    : 'men-menswear';

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  return (
    <div className="men-page">
      <MenBanner currentTag={bannerKey} />

      {isMenPath && (
        <MenTypeHeader
          title=""
          categories={MEN_CATEGORIES}
          activeCategory={urlCategory}
          onCategoryChange={onChangeCategory}
        />
      )}

      <div className="men-main">
        <MenFiltersSidebar
          sorting={sorting}
          setSorting={setSorting}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          selectedFabrics={selectedFabrics}
          setSelectedFabrics={setSelectedFabrics}
          activeCategory={urlCategory}
          isRoot={!urlCategory}
          onClearFilters={resetAllFilters}
        />

        <section className="men-products">
          <div className="products-top-row">
            <div>
              <div className="products-count">
                Showing {filteredProducts.length} item
                {filteredProducts.length !== 1 ? 's' : ''}
              </div>

              <div className="men-subline">
                Men • Menswear
                {urlCategory ? ` • ${urlCategory.replace(/-/g, ' ')}` : ''}
              </div>
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
