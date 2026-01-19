// ✅ src/context/ProductContext.jsx (DB + LOCAL MERGE + STOCK FIX)

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../supabaseClient';

// ✅ Local data imports
import womenProducts from '../data/WomenProducts';
import readyProducts from '../data/ReadyToWearProducts';
import accessories from '../data/AccessoriesProducts';
import menProducts from '../data/MenProducts';

const ProductContext = createContext(null);

export function useProducts() {
  return useContext(ProductContext);
}

// ✅ unique by id (keep FIRST)
function uniqueById(list) {
  return Array.from(new Map(list.map((it) => [String(it.id), it])).values());
}

// ✅ normalize DB images (supports array or json-string)
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

/**
 * ✅ DB STOCK NORMALIZER (IMPORTANT)
 * Rule:
 * Out of stock if in_stock === false OR stock_quantity <= 0
 */
function normalizeDbStock(p) {
  const qty = Number(p.stock_quantity ?? p.stockQuantity ?? 0);
  const flag = p.in_stock ?? p.inStock; // true/false/undefined

  if (flag === false) {
    return {
      inStockFinal: false,
      stockQuantity: Number.isFinite(qty) ? qty : 0,
    };
  }

  const safeQty = Number.isFinite(qty) ? qty : 0;
  const inStockFinal = safeQty > 0;

  // If BOTH missing => qty becomes 0 => out (as per rule)
  return { inStockFinal, stockQuantity: safeQty };
}

/**
 * ✅ LOCAL STOCK NORMALIZER
 * Local files usually don’t have stock_quantity/in_stock.
 * So:
 * - if inStock explicitly false => out
 * - else if qty provided => qty>0 in
 * - else default => IN STOCK (so local items don’t become all out)
 */
function normalizeLocalStock(p) {
  const flag = p.in_stock ?? p.inStock;
  const qtyRaw = p.stock_quantity ?? p.stockQuantity;

  if (flag === false) {
    return { inStockFinal: false, stockQuantity: Number(qtyRaw || 0) };
  }

  const qty = Number(qtyRaw);
  if (Number.isFinite(qty)) {
    return { inStockFinal: qty > 0, stockQuantity: qty };
  }

  // default for local
  return { inStockFinal: true, stockQuantity: 999 };
}

// ✅ Local image normalizer (most local already has images[])
function normalizeLocalImages(p) {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const one = p.image || p.mainImg || p.thumbnail || p.img || '';

  const finalImgs = imgs.length > 0 ? imgs : one ? [one] : [];

  return {
    images: finalImgs,
    image: one || finalImgs[0] || '',
  };
}

// ✅ DB mapper per-table so pages filters ALWAYS match
function mapDbRowToUi(p, tableName) {
  const imgPack = normalizeDbImages(p);
  const { inStockFinal, stockQuantity } = normalizeDbStock(p);

  const base = {
    ...p,
    id: String(p.id),
    title: p.title || p.name || 'Untitled Product',

    brand: p.brand || '',
    color: p.color || '',

    price: Number(p.price || 0),
    originalPrice: Number(p.original_price ?? p.originalPrice ?? 0),
    salePercent: Number(p.sale_percent ?? p.salePercent ?? 0),
    onSale: Boolean(p.on_sale ?? p.onSale ?? false),

    // ✅ FIXED
    inStock: inStockFinal,
    stockQuantity,

    popularity: Number(p.popularity || 0),
    tag: p.tag || '',

    fabric: p.fabric || '',
    material: p.material || '',
    size: p.size || '',

    description:
      p.description || p.short_description || p.product_description || '',
    details: p.details || p.long_description || p.product_details || '',

    isNew: Boolean(p.is_new ?? false),
    isBestSeller: Boolean(p.is_best_seller ?? false),

    createdAt: p.created_at || p.createdAt || '',

    images: imgPack.images,
    image: imgPack.image,

    // admin/edit helpers
    main_category: p.main_category || null,
    sub_category: p.sub_category || null,
    unstitched_type: p.unstitched_type || null,
    rtw_type: p.rtw_type || null,
    rtw_sub_type: p.rtw_sub_type || null,
    style: p.style || null,
    pieces: p.pieces || null,
  };

  // ✅ MEN
  if (tableName === 'men_products') {
    return {
      ...base,
      section: 'menswear',
      mainCategory: 'MENSWEAR',
      subCategory: String(p.sub_category || '').trim(), // KURTA / SHIRTS / SHALWAR_KAMEEZ
      category: 'men',
    };
  }

  // ✅ UNSTITCHED
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

  // ✅ READY TO WEAR
  if (tableName === 'ready_to_wear_products') {
    return {
      ...base,
      mainCategory: 'READY_TO_WEAR',
      subCategory: 'READY_TO_WEAR',
      category: 'READYTOWEAR',
      rtwType: p.rtw_type || '',
      rtwSubType: p.rtw_sub_type || p.style || '',
    };
  }

  // ✅ ACCESSORIES
  if (tableName === 'accessories_products') {
    const accMain = String(p.sub_category || p.main_category || '')
      .toUpperCase()
      .trim();

    return {
      ...base,
      mainCategory: accMain,
      subCategory: String(p.sub_category || '').trim(),
      category: 'women',
    };
  }

  // fallback
  return {
    ...base,
    mainCategory: String(p.main_category || p.mainCategory || '').toUpperCase(),
    subCategory: p.sub_category || p.subCategory || '',
    category: p.category || '',
  };
}

// ✅ Local mapper (keeps your existing local fields BUT ensures basic normalization)
function mapLocalRowToUi(p) {
  const imgPack = normalizeLocalImages(p);
  const { inStockFinal, stockQuantity } = normalizeLocalStock(p);

  const base = {
    ...p,
    id: String(p.id),
    title: p.title || p.name || 'Untitled Product',

    brand: p.brand || '',
    color: p.color || '',

    price: Number(p.price || 0),
    originalPrice: Number(p.originalPrice ?? p.original_price ?? 0),
    salePercent: Number(p.salePercent ?? p.sale_percent ?? 0),
    onSale: Boolean(p.onSale ?? p.on_sale ?? false),

    // ✅ local stock
    inStock: inStockFinal,
    stockQuantity,

    popularity: Number(p.popularity || 0),
    tag: p.tag || '',

    fabric: p.fabric || '',
    material: p.material || '',
    size: p.size || '',

    description: p.description || '',
    details: p.details || '',

    isNew: Boolean(p.isNew ?? false),
    isBestSeller: Boolean(p.isBestSeller ?? false),

    createdAt: p.createdAt || p.created_at || '',

    images: imgPack.images,
    image: imgPack.image,
  };

  // If local already has correct categories, keep them
  // (Your local data usually already has: mainCategory/subCategory/category/section etc.)
  return {
    ...base,
    mainCategory: (p.mainCategory || base.mainCategory || '').toString(),
    subCategory: (p.subCategory || base.subCategory || '').toString(),
    category: (p.category || base.category || '').toString(),
    section: p.section || base.section || undefined,
    unstitchedType: p.unstitchedType || p.unstitched_type || undefined,
    rtwType: p.rtwType || p.rtw_type || undefined,
    rtwSubType: p.rtwSubType || p.rtw_sub_type || undefined,
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('brands').select('*');
      if (!error && data) setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ 1) Local mapped (always available)
      const localAllRaw = [
        ...(Array.isArray(accessories) ? accessories : []),
        ...(Array.isArray(menProducts) ? menProducts : []),
        ...(Array.isArray(womenProducts) ? womenProducts : []),
        ...(Array.isArray(readyProducts) ? readyProducts : []),
      ];
      const mappedLocal = localAllRaw.map(mapLocalRowToUi);

      // ✅ 2) DB mapped (if supabase available)
      let mappedDb = [];
      if (supabase) {
        const [accRes, menRes, unstRes, rtwRes] = await Promise.all([
          supabase.from('accessories_products').select('*'),
          supabase.from('men_products').select('*'),
          supabase.from('unstitched_products').select('*'),
          supabase.from('ready_to_wear_products').select('*'),
        ]);

        const anyErr =
          accRes?.error || menRes?.error || unstRes?.error || rtwRes?.error;

        if (anyErr) {
          console.warn('Some product tables failed:', anyErr);
          setError(anyErr.message || 'Failed to load some products');
        }

        const dbAcc = (accRes?.data || []).map((x) =>
          mapDbRowToUi(x, 'accessories_products')
        );
        const dbMen = (menRes?.data || []).map((x) =>
          mapDbRowToUi(x, 'men_products')
        );
        const dbUn = (unstRes?.data || []).map((x) =>
          mapDbRowToUi(x, 'unstitched_products')
        );
        const dbRtw = (rtwRes?.data || []).map((x) =>
          mapDbRowToUi(x, 'ready_to_wear_products')
        );

        mappedDb = [...dbAcc, ...dbMen, ...dbUn, ...dbRtw];
      }

      /**
       * ✅ Merge Rule:
       * Keep FIRST by id => put DB first so it overrides local if same id exists.
       */
      const merged = uniqueById([...mappedDb, ...mappedLocal]);
      setProducts(merged);
    } catch (err) {
      console.error('Error fetching products:', err?.message || err);
      setError(err?.message || 'Unknown error');

      // still show local if DB fails
      const localAllRaw = [
        ...(Array.isArray(accessories) ? accessories : []),
        ...(Array.isArray(menProducts) ? menProducts : []),
        ...(Array.isArray(womenProducts) ? womenProducts : []),
        ...(Array.isArray(readyProducts) ? readyProducts : []),
      ];
      setProducts(uniqueById(localAllRaw.map(mapLocalRowToUi)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [fetchProducts, fetchBrands]);

  const value = useMemo(
    () => ({
      products,
      brands,
      loading,
      error,
      refreshProducts: fetchProducts,
      refreshBrands: fetchBrands,
    }),
    [products, brands, loading, error, fetchProducts, fetchBrands]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}
