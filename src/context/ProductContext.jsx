// src/context/ProductContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../supabaseClient';

// ✅ Local data
import womenProductsRaw from '../data/WomenProducts';
import readyToWearProductsRaw from '../data/ReadyToWearProducts';
import accessoriesRaw from '../data/AccessoriesProducts';
import menProductsRaw from '../data/MenProducts';
// ✅ Toggle: for now show only local data (10/10/10). Later set false.
const LOCAL_ONLY = true;

const ProductContext = createContext();

export function useProducts() {
  return useContext(ProductContext);
}

// ✅ unique by id (keep FIRST)
function uniqueById(list) {
  return Array.from(new Map(list.map((it) => [String(it.id), it])).values());
}

// ✅ add cache bust query param
function cacheBust(src, version) {
  if (!src) return '';
  const clean = String(src).trim();
  if (!clean) return '';
  return clean.includes('?')
    ? `${clean}&v=${version}`
    : `${clean}?v=${version}`;
}

// ✅ normalize DB images
function normalizeDbImages(p) {
  const imgs = Array.isArray(p.images)
    ? p.images
    : typeof p.images === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(p.images);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  const one =
    p.image ||
    p.main_image ||
    p.thumbnail ||
    p.img ||
    p.image_url ||
    p.imageUrl ||
    p.cover_image ||
    '';

  const finalImgs = imgs.length > 0 ? imgs.filter(Boolean) : one ? [one] : [];

  return {
    images: finalImgs,
    image: one || finalImgs[0] || '',
  };
}

// ✅ normalize local product (IMPORTANT: cache bust)
function normalizeLocalProduct(p, version) {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const one = p.image || imgs[0] || '';
  const finalImgs = imgs.length > 0 ? imgs : one ? [one] : [];

  return {
    ...p,
    id: String(p.id),
    title: p.title || 'Untitled Product',
    description: p.description || '',
    details: p.details || '',

    // ✅ images always with cache-bust
    images: finalImgs.map((s) => cacheBust(s, version)),
    image: cacheBust(one || finalImgs[0] || '', version),

    mainCategory: String(p.mainCategory || '').toUpperCase(),
    category: p.category || '',
    subCategory: p.subCategory || '',

    // ✅ MEN filter needs this
    section: p.section || '',

    brand: p.brand || '',
    color: p.color || '',
    fabric: p.fabric || '',
    material: p.material || '',
    size: p.size || '',

    price: Number(p.price || 0),
    originalPrice: Number(p.originalPrice || 0),
    salePercent: Number(p.salePercent || 0),
    onSale: Boolean(p.onSale ?? false),

    inStock: Boolean(p.inStock ?? true),
    popularity: Number(p.popularity || 0),
    tag: p.tag || '',

    // ✅ flags for home sections
    isNew: Boolean(p.isNew ?? false),
    isBestSeller: Boolean(p.isBestSeller ?? false),

    createdAt: p.createdAt || '',

    // Unstitched
    unstitchedType: p.unstitchedType || '',
    style: p.style || '',
    pieces: p.pieces || '',

    // RTW
    rtwType: p.rtwType || '',
    rtwSubType: p.rtwSubType || '',
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ asset version saved in localStorage
  const [assetVersion, setAssetVersion] = useState(() => {
    const saved = localStorage.getItem('assetVersion');
    return saved || String(Date.now());
  });

  const bumpAssetVersion = useCallback(() => {
    const v = String(Date.now());
    localStorage.setItem('assetVersion', v);
    setAssetVersion(v);
  }, []);

  // ✅ local products (memo)
  const localProducts = useMemo(() => {
    const localUnstitched = (womenProductsRaw || []).map((p) =>
      normalizeLocalProduct(p, assetVersion)
    );
    const localRTW = (readyToWearProductsRaw || []).map((p) =>
      normalizeLocalProduct(p, assetVersion)
    );
    const localAccessories = (accessoriesRaw || []).map((p) =>
      normalizeLocalProduct(p, assetVersion)
    );
    const localMen = (menProductsRaw || []).map((p) =>
      normalizeLocalProduct(p, assetVersion)
    );

    return uniqueById([
      ...localUnstitched,
      ...localRTW,
      ...localAccessories,
      ...localMen,
    ]);
  }, [assetVersion]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetVersion]);

  const fetchBrands = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('brands').select('*');
      if (!error && data) setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  // ✅ DB mapper per-table so your pages filters ALWAYS match
  function mapDbRowToUi(p, tableName) {
    const imgPack = normalizeDbImages(p);

    // base
    const base = {
      ...p,
      id: String(p.id),
      title: p.title || p.name || 'Untitled Product',

      brand: p.brand || '',
      color: p.color || '',

      price: Number(p.price || 0),
      originalPrice: Number(p.original_price || p.originalPrice || 0),
      salePercent: Number(p.sale_percent || p.salePercent || 0),
      onSale: Boolean(p.on_sale ?? p.onSale ?? false),

      inStock: Boolean(p.in_stock ?? p.inStock ?? true),
      popularity: Number(p.popularity || 0),
      tag: p.tag || '',

      fabric: p.fabric || '',
      material: p.material || '',
      size: p.size || '',

      description:
        p.description || p.short_description || p.product_description || '',
      details: p.details || p.long_description || p.product_details || '',

      // ✅ flags for home sections
      isNew: Boolean(p.is_new ?? false),
      isBestSeller: Boolean(p.is_best_seller ?? false),

      // ✅ for sorting in NewArrivals
      createdAt: p.created_at || p.createdAt || '',

      images: imgPack.images,
      image: imgPack.image,

      // keep these for admin/edit
      main_category: p.main_category || null,
      sub_category: p.sub_category || null,
      unstitched_type: p.unstitched_type || null,
      rtw_type: p.rtw_type || null,
      rtw_sub_type: p.rtw_sub_type || null,
      style: p.style || null,
      pieces: p.pieces || null,
      stock_quantity: p.stock_quantity ?? null,
    };

    // ✅ IMPORTANT: set UI keys exactly as your pages expect
    if (tableName === 'men_products') {
      return {
        ...base,
        section: 'menswear',
        mainCategory: 'MENSWEAR',
        subCategory: String(p.sub_category || '').trim(), // KURTA / SHIRTS etc
        category: 'men',
      };
    }

    if (tableName === 'unstitched_products') {
      return {
        ...base,
        mainCategory: 'UNSTITCHED',
        subCategory: 'UNSTITCHED',
        category: 'women',
        unstitchedType: p.unstitched_type || p.sub_category || '',
        style: p.style || '',
        pieces: p.pieces || '',
      };
    }

    if (tableName === 'ready_to_wear_products') {
      return {
        ...base,
        mainCategory: 'READY_TO_WEAR',
        subCategory: 'READY_TO_WEAR',
        category: 'women',
        rtwType: p.rtw_type || '',
        rtwSubType: p.rtw_sub_type || p.style || '',
      };
    }

    if (tableName === 'accessories_products') {
      // AccessoriesPage expects mainCategory = JEWELLRY/SHAWLS/... (not "ACCESSORIES")
      const accMain = String(p.sub_category || p.main_category || '')
        .toUpperCase()
        .trim();

      return {
        ...base,
        mainCategory: accMain, // JEWELLRY / SHAWLS / HAIR ACCESSORIES / ...
        subCategory: String(p.sub_category || '').trim(),
        category: 'women',
      };
    }

    // fallback
    return {
      ...base,
      mainCategory: String(
        p.main_category || p.mainCategory || ''
      ).toUpperCase(),
      subCategory: p.sub_category || p.subCategory || '',
      category: p.category || '',
    };
  }

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Start with local list
      let finalList = uniqueById([...localProducts]);

      // ✅ IMPORTANT: for now do NOT read database products
      if (LOCAL_ONLY) {
        setProducts(finalList);
        return;
      }

      if (!supabase) {
        setProducts(finalList);
        return;
      }

      // ✅ DB: Fetch ALL tables
      const [accRes, menRes, unstRes, rtwRes] = await Promise.all([
        supabase.from('accessories_products').select('*'),
        supabase.from('men_products').select('*'),
        supabase.from('unstitched_products').select('*'),
        supabase.from('ready_to_wear_products').select('*'),
      ]);

      const mappedAcc = (accRes?.data || []).map((p) =>
        mapDbRowToUi(p, 'accessories_products')
      );
      const mappedMen = (menRes?.data || []).map((p) =>
        mapDbRowToUi(p, 'men_products')
      );
      const mappedUn = (unstRes?.data || []).map((p) =>
        mapDbRowToUi(p, 'unstitched_products')
      );
      const mappedRtw = (rtwRes?.data || []).map((p) =>
        mapDbRowToUi(p, 'ready_to_wear_products')
      );

      const mappedDb = [...mappedAcc, ...mappedMen, ...mappedUn, ...mappedRtw];

      // Local wins over DB if same id
      finalList = uniqueById([...mappedDb, ...localProducts]);

      setProducts(finalList);
    } catch (err) {
      console.error('Error fetching products:', err?.message || err);
      setError(err?.message || 'Unknown error');
      setProducts(uniqueById([...localProducts]));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        brands,
        loading,
        error,
        refreshProducts: fetchProducts,
        refreshBrands: fetchBrands,
        refreshImages: bumpAssetVersion,
        assetVersion,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
