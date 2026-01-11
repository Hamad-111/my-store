// src/constants/brandOptions.js

// ✅ Women (Unstitched) brands
export const WOMEN_BRANDS = [
  'Sapphire',
  'Alkaram',
  'Khaadi',
  'Nishat',
  'J.',
  'Satrangi',
];

// ✅ Ready To Wear brands
export const RTW_BRANDS = ['Alkaram', 'Khaadi', 'Nishat', 'J.', 'Sapphire'];

// ✅ Men brands
export const MEN_BRANDS = ['J.', 'Nishat', 'Alkaram'];

// ✅ Accessories brands
export const ACCESSORIES_BRANDS_COMMON = ['Alkaram', 'Khaadi', 'Sapphire'];
export const ACCESSORIES_BRANDS_JEWELLERY = ['Alkaram', 'Khaadi', 'Sapphire'];

// ✅ Logos mapping (NO DUPLICATE KEYS)
export const BRAND_LOGOS = {
  Sapphire: '/images/sapphire.png',
  Alkaram: '/images/alkaram studio.png',
  Khaadi: '/images/khaddii.png',
  Nishat: '/images/nishat line.png',
  'J.': '/images/j.png',
  Satrangi: '/images/satrangi.png',
};

// ✅ All brands for BrandPage (unique + sorted)
export const ALL_FILTER_BRANDS = Array.from(
  new Set([
    ...WOMEN_BRANDS,
    ...RTW_BRANDS,
    ...MEN_BRANDS,
    ...ACCESSORIES_BRANDS_COMMON,
    ...ACCESSORIES_BRANDS_JEWELLERY,
  ])
).sort((a, b) => a.localeCompare(b));
