// ✅ src/components/Breadcrumbs.jsx
import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import './Breadcrumbs.css';
import { useProducts } from '../context/ProductContext';

const titleCase = (str = '') =>
  String(str)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const safeParse = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const STATIC_ROUTES = {
  '/compare': { label: 'Compare', to: '/compare' },
  '/complaint': { label: 'Complaint', to: '/complaint' },
  '/faqs': { label: 'FAQs', to: '/faqs' },
  '/wishlist': { label: 'Wishlist', to: '/wishlist' },
  '/cart': { label: 'Cart', to: '/cart' },
  '/checkout': { label: 'Checkout', to: '/checkout' },
  '/orders': { label: 'My Orders', to: '/orders' },
  '/profile': { label: 'My Profile', to: '/profile' },
  '/contact': { label: 'Contact', to: '/contact' },
  '/about': { label: 'About', to: '/about' },
  '/privacy-policy': { label: 'Privacy Policy', to: '/privacy-policy' },
  '/terms': { label: 'Terms & Conditions', to: '/terms' },
  '/brands': { label: 'Brands', to: '/brands' },
};

const buildTrailFromLocation = (pathname, search) => {
  const params = new URLSearchParams(search || '');
  const trail = [{ label: 'Home', to: '/' }];

  // ✅ Product page handled in crumbs useMemo
  if (pathname.startsWith('/product/')) return trail;

  // ✅ Static pages (compare, faqs, cart, etc.)
  if (STATIC_ROUTES[pathname]) {
    trail.push(STATIC_ROUTES[pathname]);
    return trail;
  }

  // ✅ Women root
  if (pathname === '/women') {
    trail.push({ label: 'Women', to: '/women' });

    const brand = params.get('brand');
    if (brand) {
      trail.push({
        label: titleCase(brand),
        to: `/women?brand=${encodeURIComponent(brand)}`,
      });
    }
    return trail;
  }

  // ✅ Unstitched
  if (pathname === '/unstitched') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Unstitched', to: '/unstitched' });

    const type = params.get('type');
    if (type) {
      trail.push({
        label: titleCase(type),
        to: `/unstitched?type=${encodeURIComponent(type)}`,
      });
    }
    return trail;
  }

  // ✅ Ready to wear
  if (pathname === '/ready-to-wear') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Ready To Wear', to: '/ready-to-wear' });

    const type = params.get('type');
    if (type) {
      trail.push({
        label: titleCase(type),
        to: `/ready-to-wear?type=${encodeURIComponent(type)}`,
      });
    }
    return trail;
  }

  // ✅ Accessories
  if (pathname === '/accessories') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Accessories', to: '/accessories' });

    const cat = params.get('cat');
    if (cat) {
      trail.push({
        label: titleCase(cat),
        to: `/accessories?cat=${encodeURIComponent(cat)}`,
      });
    }
    return trail;
  }

  // ✅ Men
  if (pathname === '/men') {
    trail.push({ label: 'Men', to: '/men' });

    const section = params.get('section');
    const category = params.get('category');

    if (section) {
      trail.push({
        label: titleCase(section),
        to: `/men?section=${encodeURIComponent(section)}`,
      });
    }

    if (category) {
      const to = section
        ? `/men?section=${encodeURIComponent(
          section
        )}&category=${encodeURIComponent(category)}`
        : `/men?category=${encodeURIComponent(category)}`;

      trail.push({ label: titleCase(category), to });
    }

    return trail;
  }

  // ✅ Fallback: auto-generate crumbs from path segments
  // Example: /account/settings => Home / Account / Settings
  const parts = pathname.split('/').filter(Boolean);
  let current = '';
  for (const p of parts) {
    current += `/${p}`;
    trail.push({ label: titleCase(p), to: current });
  }

  return trail;
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { pathname, search } = location;
  const { id } = useParams();
  const { products: allProducts = [] } = useProducts() || {};

  // ✅ Hide on these routes
  if (
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/admin')
  ) {
    return null;
  }

  // ✅ find product
  const product = useMemo(() => {
    if (!id) return null;
    return (allProducts || []).find((p) => String(p.id) === String(id)) || null;
  }, [allProducts, id]);

  // ✅ SAVE TRAIL on every non-product route
  useEffect(() => {
    if (pathname.startsWith('/product/')) return;

    const trail = buildTrailFromLocation(pathname, search);

    if (trail.length > 1) {
      try {
        sessionStorage.setItem('vv_trail', JSON.stringify(trail));
      } catch { }
    }
  }, [pathname, search]);

  const crumbs = useMemo(() => {
    // ✅ PRODUCT PAGE: use saved trail
    if (pathname.startsWith('/product/')) {
      const savedTrail = safeParse(
        sessionStorage.getItem('vv_trail') || 'null'
      );

      const base =
        Array.isArray(savedTrail) && savedTrail.length
          ? savedTrail
          : [{ label: 'Home', to: '/' }];

      const list = [...base];

      // ✅ add Brand (avoid duplicate)
      const brand = product?.brand ? titleCase(product.brand) : null;
      if (brand) {
        const exists = list.some(
          (x) => String(x.label).toLowerCase() === brand.toLowerCase()
        );

        if (!exists) {
          list.push({
            label: brand,
            to: `/women?brand=${encodeURIComponent(product.brand)}`,
          });
        }
      }

      // ✅ add Product title
      list.push({
        label: titleCase(product?.title || product?.name || 'Product'),
        to: pathname,
      });

      return list;
    }

    // ✅ NORMAL PAGE
    return buildTrailFromLocation(pathname, search);
  }, [pathname, search, product]);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="breadcrumbs-inner">
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <React.Fragment key={`${c.to}-${c.label}-${idx}`}>
              {idx !== 0 && <span className="bc-sep">/</span>}

              {isLast ? (
                <span className="bc-item active">{c.label}</span>
              ) : (
                <Link className="bc-item" to={c.to}>
                  {c.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
