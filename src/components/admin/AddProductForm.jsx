// src/components/admin/AddProductForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import './AddProductForm.css';

const BUCKET_NAME = 'products';

// ---------- NAVBAR / TYPEHEADER MATCHING ----------
const MAIN = [
  { label: 'Women', value: 'WOMEN' },
  { label: 'Men', value: 'MEN' },
];

const WOMEN_SECTIONS = [
  { label: 'Unstitched', value: 'UNSTITCHED' },
  { label: 'Ready To Wear', value: 'READY_TO_WEAR' },
  { label: 'Accessories', value: 'ACCESSORIES' },
];

const MEN_CATS = [
  { label: 'Kurta', value: 'KURTA' },
  { label: 'Shalwar Kameez', value: 'SHALWAR_KAMEEZ' },
  { label: 'Shirts', value: 'SHIRTS' },
];

const MEN_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const UNSTITCHED_TYPES = [
  { label: 'Winter', value: 'WINTER' },
  { label: 'Printed', value: 'PRINTED' },
  { label: 'Embroidered', value: 'EMBROIDERED' },
  { label: 'Velvet', value: 'VELVET' },
];

const UNSTITCHED_STYLE_BY_TYPE = {
  WINTER: [
    { label: 'Printed', value: 'PRINTED' },
    { label: 'Embroidered', value: 'EMBROIDERED' },
  ],
  PRINTED: [
    { label: 'Signature', value: 'SIGNATURE' },
    { label: 'Glam', value: 'GLAM' },
    { label: 'Dailywear', value: 'DAILYWEAR' },
  ],
  EMBROIDERED: [
    { label: 'Signature', value: 'SIGNATURE' },
    { label: 'Glam', value: 'GLAM' },
    { label: 'Dailywear', value: 'DAILYWEAR' },
  ],
  VELVET: [],
};

const PIECES = ['1 Piece', '2 Piece', '3 Piece'];

const RTW_TYPES = [
  { label: 'Embroidered', value: 'EMBROIDERED' },
  { label: 'Printed', value: 'PRINTED' },
  { label: 'Solids', value: 'SOLIDS' },
  { label: 'Co-ords', value: 'COORDS' },
  { label: 'Formals', value: 'FORMALS' },
  { label: 'Kurtis', value: 'KURTIS' },
  { label: 'Bottoms', value: 'BOTTOMS' },
];

const RTW_SUBTYPE_BY_TYPE = {
  EMBROIDERED: ['Casual', 'Semi Formal', 'Luxury'],
  PRINTED: ['Casual', '2 Piece', '3 Piece'],
  SOLIDS: ['Everyday', 'Office Wear'],
  COORDS: ['2 Piece', '3 Piece'],
  FORMALS: ['Party Wear', 'Wedding Wear'],
  KURTIS: ['Short Kurti', 'Long Kurti'],
  BOTTOMS: ['Trousers', 'Cigarette Pants', 'Shalwar'],
};

const ACCESSORY_TYPES = [
  { label: 'Jewellery', value: 'JEWELLRY' },
  { label: 'Shawls', value: 'SHAWLS' },
  { label: 'Hair Accessories', value: 'HAIR ACCESSORIES' },
  { label: 'Sunglasses', value: 'SUNGLASSES' },
  { label: 'Scarves', value: 'SCARVES' },
];

const RTW_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ---------- Helpers ----------
const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

async function uploadSingleImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;

  const timeoutMs = 30000;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Upload timed out after ${
            timeoutMs / 1000
          } seconds. Check internet connection.`
        )
      );
    }, timeoutMs);
  });

  const uploadPromise = supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);
  const { error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    console.error('Full Upload Error:', error);
    if (
      error.message?.includes('Bucket not found') ||
      error.message?.includes('The resource was not found')
    ) {
      throw new Error(
        `Storage bucket '${BUCKET_NAME}' not found. Supabase dashboard me bucket create karo.`
      );
    }
    throw error;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}

// Auto table mapping
function getTable(mainCategory, womenSection) {
  if (mainCategory === 'MEN') return 'men_products';
  if (womenSection === 'UNSTITCHED') return 'unstitched_products';
  if (womenSection === 'READY_TO_WEAR') return 'ready_to_wear_products';
  if (womenSection === 'ACCESSORIES') return 'accessories_products';
  return 'unstitched_products';
}

export default function AddProductForm({
  onClose,
  onProductAdded,
  mode = 'create', // 'create' | 'edit'
  initialData = null, // { table, row }
}) {
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ------------- CORE FIELDS -------------
  const [form, setForm] = useState({
    id: '',
    title: '',
    brand: '',
    color: '',
    tag: '',
    popularity: 50,

    price: '',
    originalPrice: '',
    salePercent: 0,

    inStock: true,
    stockQuantity: 1,

    isNew: false,
    isBestSeller: false,

    description: '',
    details: '',
  });

  // ------------- CATEGORY STATE -------------
  const [cat, setCat] = useState({
    mainCategory: 'WOMEN',
    womenSection: 'UNSTITCHED',

    unstitchedType: 'WINTER',
    unstitchedStyle: '',
    pieces: '3 Piece',
    fabric: '',

    rtwType: 'EMBROIDERED',
    rtwSubType: '',
    size: '',

    accessoryType: 'JEWELLRY',

    menCategory: 'KURTA',
  });

  // ✅ ------------- IMAGES (4 TOTAL) -------------
  // thumb
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');

  // 3 extras
  const [extraFiles, setExtraFiles] = useState([null, null, null]);
  const [extraPreviews, setExtraPreviews] = useState(['', '', '']);

  // --------- Derived flags ----------
  const tableName = useMemo(
    () => getTable(cat.mainCategory, cat.womenSection),
    [cat.mainCategory, cat.womenSection]
  );

  const showRTWSizes =
    cat.mainCategory === 'WOMEN' && cat.womenSection === 'READY_TO_WEAR';

  const showMenSizes =
    cat.mainCategory === 'MEN' &&
    (cat.menCategory === 'KURTA' || cat.menCategory === 'SHIRTS');

  const unstitchedStyleOptions = useMemo(() => {
    return UNSTITCHED_STYLE_BY_TYPE[cat.unstitchedType] || [];
  }, [cat.unstitchedType]);

  const rtwSubTypeOptions = useMemo(() => {
    return RTW_SUBTYPE_BY_TYPE[cat.rtwType] || [];
  }, [cat.rtwType]);

  // --------- Edit mode load ----------
  useEffect(() => {
    if (!isEdit || !initialData?.row || !initialData?.table) return;
    const row = initialData.row;

    // ✅ restore images like ProductContext normalizeDbImages expects:
    // image = thumb, images = array
    const imgs = Array.isArray(row.images)
      ? row.images
      : typeof row.images === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(row.images);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

    const thumb = row.image || imgs[0] || '';
    const extras = imgs.filter(Boolean).slice(1, 4); // 3 extras
    const filledExtras = [extras[0] || '', extras[1] || '', extras[2] || ''];

    setThumbPreview(thumb || '');
    setExtraPreviews(filledExtras);

    setForm((p) => ({
      ...p,
      id: row.id || '',
      title: row.title || '',
      brand: row.brand || '',
      color: row.color || '',
      tag: row.tag || '',
      popularity: row.popularity ?? 50,
      price: row.price ?? '',
      originalPrice: row.original_price ?? row.originalPrice ?? '',
      salePercent: row.sale_percent ?? row.salePercent ?? 0,
      inStock: row.in_stock ?? row.inStock ?? true,
      stockQuantity: row.stock_quantity ?? row.stockQuantity ?? 1,
      isNew: !!(row.is_new ?? row.isNew),
      isBestSeller: !!(row.is_best_seller ?? row.isBestSeller),
      description: row.description || '',
      details: row.details || '',
    }));

    // Category restore
    const isMen = initialData.table === 'men_products';

    if (isMen) {
      setCat((p) => ({
        ...p,
        mainCategory: 'MEN',
        menCategory: row.sub_category || 'KURTA',
        fabric: row.fabric || '',
        size: row.size || '',
      }));
      return;
    }

    const isUn = initialData.table === 'unstitched_products';
    const isRtw = initialData.table === 'ready_to_wear_products';
    const isAcc = initialData.table === 'accessories_products';

    setCat((p) => ({
      ...p,
      mainCategory: 'WOMEN',
      womenSection: isUn
        ? 'UNSTITCHED'
        : isRtw
        ? 'READY_TO_WEAR'
        : 'ACCESSORIES',

      unstitchedType: row.unstitched_type || row.sub_category || 'WINTER',
      unstitchedStyle: row.style || '',
      pieces: row.pieces || '3 Piece',
      fabric: row.fabric || '',

      rtwType: row.rtw_type || 'EMBROIDERED',
      rtwSubType: row.rtw_sub_type || row.style || '',

      accessoryType: row.sub_category || 'JEWELLRY',
      size: row.size || '',
    }));
  }, [isEdit, initialData]);

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const onThumbChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const onExtraChange = (index, e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setExtraFiles((prev) => {
      const next = [...prev];
      next[index] = f;
      return next;
    });

    setExtraPreviews((prev) => {
      const next = [...prev];
      next[index] = URL.createObjectURL(f);
      return next;
    });
  };

  const clearExtra = (index) => {
    setExtraFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setExtraPreviews((prev) => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  };

  const toggleSize = (size, allowedOrder) => {
    setCat((p) => {
      const current = p.size
        ? p.size
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const has = current.includes(size);
      const next = has ? current.filter((x) => x !== size) : [...current, size];
      next.sort((a, b) => allowedOrder.indexOf(a) - allowedOrder.indexOf(b));
      return { ...p, size: next.join(', ') };
    });
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('Starting...');
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      setStatusMessage('');
      setError('Session expired. Please log out and log in again.');
      return;
    }

    try {
      if (!form.title.trim() || !form.brand.trim() || form.price === '') {
        throw new Error('Title, Brand, aur Price required hain.');
      }

      // ✅ thumb required (create mode only)
      if (!isEdit && !thumbFile) {
        throw new Error('Thumbnail image upload karo.');
      }

      // category validation
      if (cat.mainCategory === 'WOMEN') {
        if (!cat.womenSection) throw new Error('Women section select karo.');
        if (cat.womenSection === 'UNSTITCHED' && !cat.unstitchedType) {
          throw new Error('Unstitched type select karo.');
        }
        if (cat.womenSection === 'READY_TO_WEAR' && !cat.rtwType) {
          throw new Error('RTW type select karo.');
        }
        if (cat.womenSection === 'READY_TO_WEAR' && !cat.size) {
          throw new Error('RTW ke liye sizes select karo.');
        }
        if (cat.womenSection === 'ACCESSORIES' && !cat.accessoryType) {
          throw new Error('Accessory type select karo.');
        }
      } else {
        if (!cat.menCategory) throw new Error('Men category select karo.');
        if (
          (cat.menCategory === 'KURTA' || cat.menCategory === 'SHIRTS') &&
          !cat.size
        ) {
          throw new Error('Men (Kurta/Shirts) ke liye sizes select karo.');
        }
      }

      // ✅ Upload images
      setStatusMessage('Uploading images...');

      // thumb url (edit mode supports existing)
      const existingThumbUrl = thumbPreview && !thumbFile ? thumbPreview : '';
      const thumbUrl = thumbFile
        ? await uploadSingleImage(thumbFile)
        : existingThumbUrl;

      if (!thumbUrl) throw new Error('Thumbnail upload failed.');

      // extras: existing previews (in edit) OR upload new file
      const extraUrls = [];
      for (let i = 0; i < 3; i++) {
        const existing =
          extraPreviews[i] && !extraFiles[i] ? extraPreviews[i] : '';
        const uploaded = extraFiles[i]
          ? await uploadSingleImage(extraFiles[i])
          : '';
        const final = uploaded || existing || '';
        if (final) extraUrls.push(final);
      }

      // Final images array: [thumb + up to 3 extras] (total max 4)
      const imagesArr = [thumbUrl, ...extraUrls].slice(0, 4);

      // pricing
      const price = Number(form.price);
      const original =
        form.originalPrice === '' ? null : Number(form.originalPrice);
      const salePercent = Number(form.salePercent || 0);
      const onSale = salePercent > 0 || (original !== null && original > price);

      // category mapping to DB fields
      let main_category = null;
      let sub_category = null;

      let unstitched_type = null;
      let rtw_type = null;
      let rtw_sub_type = null;
      let style = null;
      let pieces = null;
      let fabric = cat.fabric || null;
      let size = null;

      if (cat.mainCategory === 'MEN') {
        main_category = 'MENSWEAR';
        sub_category = cat.menCategory;
        size =
          cat.menCategory === 'KURTA' || cat.menCategory === 'SHIRTS'
            ? cat.size || null
            : null;
      } else {
        if (cat.womenSection === 'UNSTITCHED') {
          main_category = 'UNSTITCHED';
          sub_category = 'UNSTITCHED';
          unstitched_type = cat.unstitchedType;
          style = cat.unstitchedStyle || null;
          pieces = cat.pieces || null;
          size = null;
        }

        if (cat.womenSection === 'READY_TO_WEAR') {
          main_category = 'READY_TO_WEAR';
          sub_category = 'READY_TO_WEAR';
          rtw_type = cat.rtwType;
          rtw_sub_type = cat.rtwSubType || null;
          size = cat.size || null;
        }

        if (cat.womenSection === 'ACCESSORIES') {
          main_category = 'ACCESSORIES';
          sub_category = cat.accessoryType; // JEWELLRY, SHAWLS...
          size = cat.size || null;
        }
      }

      // ✅ Common payload (matches ProductContext mapping)
      const basePayload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        color: form.color?.trim() || null,

        price,
        original_price: original,
        sale_percent: salePercent,
        on_sale: !!onSale,

        is_new: !!form.isNew,
        is_best_seller: !!form.isBestSeller,

        in_stock: !!form.inStock,
        stock_quantity: Number(form.stockQuantity || 0),
        popularity: Number(form.popularity || 0),

        tag: form.tag?.trim() || null,

        description: form.description?.trim() || null,
        details: form.details || null,

        // ✅ THUMB + IMAGES ARRAY (4 total)
        image: thumbUrl, // thumb for ProductManagement table
        images: imagesArr, // ProductContext reads this fine

        main_category,
        sub_category,
        fabric,
      };

      let finalPayload = { ...basePayload };

      if (cat.mainCategory === 'MEN') {
        finalPayload = { ...finalPayload, size };
      } else {
        if (cat.womenSection === 'UNSTITCHED') {
          finalPayload = { ...finalPayload, unstitched_type, style, pieces };
        } else if (cat.womenSection === 'READY_TO_WEAR') {
          finalPayload = { ...finalPayload, rtw_type, rtw_sub_type, size };
        } else if (cat.womenSection === 'ACCESSORIES') {
          finalPayload = { ...finalPayload, size };
        }
      }

      setStatusMessage(isEdit ? 'Updating product...' : 'Saving product...');

      if (isEdit) {
        const pid = initialData?.row?.id;
        if (!pid) throw new Error('Edit mode: product id missing.');

        const { error: upErr } = await supabase
          .from(initialData.table)
          .update(finalPayload)
          .eq('id', pid);

        if (upErr) throw upErr;
      } else {
        const newId = form.id?.trim() ? form.id.trim() : generateUUID();
        const insertPayload = { id: newId, ...finalPayload };

        const { error: insErr } = await supabase
          .from(tableName)
          .insert([insertPayload]);
        if (insErr) throw insErr;
      }

      setSuccess(true);
      setTimeout(() => {
        onProductAdded?.();
        onClose?.();
      }, 900);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  if (success) {
    return (
      <div className="apf-success">
        <Check size={48} />
        <h3>{isEdit ? 'Product Updated!' : 'Product Added Successfully!'}</h3>
        <p>Admin panel updated.</p>
      </div>
    );
  }

  return (
    <div className="apf-wrap">
      <div className="apf-card">
        <div className="apf-head">
          <div>
            <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
            <p className="apf-sub">
              Add complete product data (Women/Men) with 4 images & categories.
            </p>
          </div>
          <button
            className="apf-close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="apf-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="apf-form">
          {/* ---------- CATEGORY TOP ---------- */}
          <div className="apf-section">
            <div className="apf-section-title">Category</div>

            <div className="apf-grid2">
              <div className="apf-field">
                <label>Main</label>
                <select
                  value={cat.mainCategory}
                  onChange={(e) =>
                    setCat((p) => ({
                      ...p,
                      mainCategory: e.target.value,
                      womenSection: 'UNSTITCHED',
                      unstitchedType: 'WINTER',
                      unstitchedStyle: '',
                      rtwType: 'EMBROIDERED',
                      rtwSubType: '',
                      accessoryType: 'JEWELLRY',
                      menCategory: 'KURTA',
                      size: '',
                    }))
                  }
                >
                  {MAIN.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {cat.mainCategory === 'WOMEN' ? (
                <div className="apf-field">
                  <label>Women Section</label>
                  <select
                    value={cat.womenSection}
                    onChange={(e) =>
                      setCat((p) => ({
                        ...p,
                        womenSection: e.target.value,
                        size: '',
                        unstitchedStyle: '',
                        rtwSubType: '',
                      }))
                    }
                  >
                    {WOMEN_SECTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="apf-field">
                  <label>Men Category</label>
                  <select
                    value={cat.menCategory}
                    onChange={(e) =>
                      setCat((p) => ({
                        ...p,
                        menCategory: e.target.value,
                        size: '',
                      }))
                    }
                  >
                    {MEN_CATS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ✅ MEN sizes */}
            {showMenSizes && (
              <div className="apf-grid2" style={{ marginTop: 12 }}>
                <div className="apf-field apf-span2">
                  <label>Available Sizes (Men)</label>
                  <div className="apf-sizegrid">
                    {MEN_SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`apf-size ${
                          cat.size
                            .split(',')
                            .map((s) => s.trim())
                            .includes(sz)
                            ? 'active'
                            : ''
                        }`}
                        onClick={() => toggleSize(sz, MEN_SIZES)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  <div className="apf-hint">Selected: {cat.size || 'None'}</div>
                </div>
              </div>
            )}

            {/* WOMEN - UNSTITCHED */}
            {cat.mainCategory === 'WOMEN' &&
              cat.womenSection === 'UNSTITCHED' && (
                <div className="apf-grid2" style={{ marginTop: 12 }}>
                  <div className="apf-field">
                    <label>Unstitched Type</label>
                    <select
                      value={cat.unstitchedType}
                      onChange={(e) =>
                        setCat((p) => ({
                          ...p,
                          unstitchedType: e.target.value,
                          unstitchedStyle: '',
                        }))
                      }
                    >
                      {UNSTITCHED_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="apf-field">
                    <label>Pieces</label>
                    <select
                      value={cat.pieces}
                      onChange={(e) =>
                        setCat((p) => ({ ...p, pieces: e.target.value }))
                      }
                    >
                      {PIECES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {unstitchedStyleOptions.length > 0 && (
                    <div className="apf-field apf-span2">
                      <label>Style</label>
                      <div className="apf-chips">
                        {unstitchedStyleOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`apf-chip ${
                              cat.unstitchedStyle === opt.value ? 'active' : ''
                            }`}
                            onClick={() =>
                              setCat((p) => ({
                                ...p,
                                unstitchedStyle: opt.value,
                              }))
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="apf-field apf-span2">
                    <label>Fabric (optional)</label>
                    <input
                      value={cat.fabric}
                      onChange={(e) =>
                        setCat((p) => ({ ...p, fabric: e.target.value }))
                      }
                      placeholder="e.g. Khaddar, Lawn"
                    />
                  </div>
                </div>
              )}

            {/* WOMEN - RTW */}
            {cat.mainCategory === 'WOMEN' &&
              cat.womenSection === 'READY_TO_WEAR' && (
                <div className="apf-grid2" style={{ marginTop: 12 }}>
                  <div className="apf-field">
                    <label>RTW Type</label>
                    <select
                      value={cat.rtwType}
                      onChange={(e) =>
                        setCat((p) => ({
                          ...p,
                          rtwType: e.target.value,
                          rtwSubType: '',
                          size: '',
                        }))
                      }
                    >
                      {RTW_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="apf-field">
                    <label>RTW Sub Type (optional)</label>
                    <select
                      value={cat.rtwSubType}
                      onChange={(e) =>
                        setCat((p) => ({ ...p, rtwSubType: e.target.value }))
                      }
                    >
                      <option value="">None</option>
                      {rtwSubTypeOptions.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showRTWSizes && (
                    <div className="apf-field apf-span2">
                      <label>Available Sizes (RTW only) *</label>
                      <div className="apf-sizegrid">
                        {RTW_SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            className={`apf-size ${
                              cat.size
                                .split(',')
                                .map((s) => s.trim())
                                .includes(sz)
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => toggleSize(sz, RTW_SIZES)}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      <div className="apf-hint">
                        Selected: {cat.size || 'None'}
                      </div>
                    </div>
                  )}

                  <div className="apf-field apf-span2">
                    <label>Fabric (optional)</label>
                    <input
                      value={cat.fabric}
                      onChange={(e) =>
                        setCat((p) => ({ ...p, fabric: e.target.value }))
                      }
                      placeholder="e.g. Cotton"
                    />
                  </div>
                </div>
              )}

            {/* WOMEN - ACCESSORIES */}
            {cat.mainCategory === 'WOMEN' &&
              cat.womenSection === 'ACCESSORIES' && (
                <div className="apf-grid2" style={{ marginTop: 12 }}>
                  <div className="apf-field">
                    <label>Accessory Type</label>
                    <select
                      value={cat.accessoryType}
                      onChange={(e) =>
                        setCat((p) => ({
                          ...p,
                          accessoryType: e.target.value,
                          size: '',
                        }))
                      }
                    >
                      {ACCESSORY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="apf-field">
                    <label>Fabric/Material (optional)</label>
                    <input
                      value={cat.fabric}
                      onChange={(e) =>
                        setCat((p) => ({ ...p, fabric: e.target.value }))
                      }
                      placeholder="e.g. Leather, Metal"
                    />
                  </div>
                </div>
              )}

            <div className="apf-note">
              <strong>Auto Table:</strong>{' '}
              {isEdit ? initialData?.table : tableName}
            </div>
          </div>

          {/* ---------- IMAGES (4) ---------- */}
          <div className="apf-section">
            <div className="apf-section-title">Images (4 total)</div>

            <div className="apf-grid2">
              {/* Thumbnail */}
              <div className="apf-field apf-span2">
                <label>Thumbnail (Main) *</label>
                <div className={`apf-drop ${thumbPreview ? 'has' : ''}`}>
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="thumb" />
                  ) : (
                    <div className="apf-drop-empty">
                      <Upload size={26} />
                      <span>Click to upload thumbnail</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onThumbChange}
                  />
                </div>
              </div>

              {/* 3 extra images */}
              <div className="apf-field">
                <label>Extra Image 1</label>
                <div className={`apf-drop sm ${extraPreviews[0] ? 'has' : ''}`}>
                  {extraPreviews[0] ? (
                    <>
                      <img src={extraPreviews[0]} alt="extra1" />
                      <button
                        type="button"
                        className="apf-clear"
                        onClick={() => clearExtra(0)}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="apf-drop-empty">
                      <Upload size={20} />
                      <span>Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onExtraChange(0, e)}
                  />
                </div>
              </div>

              <div className="apf-field">
                <label>Extra Image 2</label>
                <div className={`apf-drop sm ${extraPreviews[1] ? 'has' : ''}`}>
                  {extraPreviews[1] ? (
                    <>
                      <img src={extraPreviews[1]} alt="extra2" />
                      <button
                        type="button"
                        className="apf-clear"
                        onClick={() => clearExtra(1)}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="apf-drop-empty">
                      <Upload size={20} />
                      <span>Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onExtraChange(1, e)}
                  />
                </div>
              </div>

              <div className="apf-field">
                <label>Extra Image 3</label>
                <div className={`apf-drop sm ${extraPreviews[2] ? 'has' : ''}`}>
                  {extraPreviews[2] ? (
                    <>
                      <img src={extraPreviews[2]} alt="extra3" />
                      <button
                        type="button"
                        className="apf-clear"
                        onClick={() => clearExtra(2)}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="apf-drop-empty">
                      <Upload size={20} />
                      <span>Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onExtraChange(2, e)}
                  />
                </div>
              </div>

              <div className="apf-note apf-span2">
                <strong>Note:</strong> ProductContext DB mapping will read{' '}
                <code>image</code> as thumbnail and <code>images</code> as
                array.
              </div>
            </div>
          </div>

          {/* ---------- PRODUCT INFO ---------- */}
          <div className="apf-section">
            <div className="apf-section-title">Product Info</div>

            {!isEdit && (
              <div className="apf-field">
                <label>Custom ID (optional)</label>
                <input
                  value={form.id}
                  onChange={(e) => setField('id', e.target.value)}
                  placeholder="Leave empty to auto-generate"
                />
              </div>
            )}

            <div className="apf-grid2">
              <div className="apf-field">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="e.g. Winter Printed Khaddar 3 Piece Suit"
                  required
                />
              </div>

              <div className="apf-field">
                <label>Brand *</label>
                <input
                  value={form.brand}
                  onChange={(e) => setField('brand', e.target.value)}
                  placeholder="e.g. AlKaram"
                  required
                />
              </div>

              <div className="apf-field">
                <label>Color</label>
                <input
                  value={form.color}
                  onChange={(e) => setField('color', e.target.value)}
                  placeholder="e.g. White"
                />
              </div>

              <div className="apf-field">
                <label>Tag</label>
                <input
                  value={form.tag}
                  onChange={(e) => setField('tag', e.target.value)}
                  placeholder="e.g. new / winter"
                />
              </div>

              <div className="apf-field">
                <label>Popularity (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.popularity}
                  onChange={(e) => setField('popularity', e.target.value)}
                />
              </div>
            </div>

            <div className="apf-grid2">
              <div className="apf-field">
                <label>Sale Price (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  required
                />
              </div>

              <div className="apf-field">
                <label>Original Price</label>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setField('originalPrice', e.target.value)}
                  placeholder="e.g. 6500"
                />
              </div>

              <div className="apf-field">
                <label>Sale %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.salePercent}
                  onChange={(e) => setField('salePercent', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ---------- STOCK + FLAGS ---------- */}
          <div className="apf-section">
            <div className="apf-section-title">Stock & Flags</div>

            <div className="apf-grid2">
              <div className="apf-field">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setField('stockQuantity', e.target.value)}
                />
              </div>

              <div className="apf-checks">
                <label className="apf-check">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setField('inStock', e.target.checked)}
                  />
                  Available in Stock
                </label>

                <label className="apf-check">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setField('isNew', e.target.checked)}
                  />
                  New Arrival
                </label>

                <label className="apf-check">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => setField('isBestSeller', e.target.checked)}
                  />
                  Best Seller
                </label>
              </div>
            </div>
          </div>

          {/* ---------- DESCRIPTION ---------- */}
          <div className="apf-section">
            <div className="apf-section-title">Descriptions</div>

            <div className="apf-field">
              <label>Small Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Short description..."
              />
            </div>

            <div className="apf-field">
              <label>Details (multiline)</label>
              <textarea
                rows="7"
                value={form.details}
                onChange={(e) => setField('details', e.target.value)}
                placeholder={`Unstitched 3-Piece\n\nShirt...\nDupatta...\nTrouser...`}
              />
            </div>
          </div>

          <button className="apf-submit" type="submit" disabled={loading}>
            {loading
              ? statusMessage || 'Saving...'
              : isEdit
              ? 'Update Product'
              : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
