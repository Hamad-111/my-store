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

// ✅ trail for NON-product pages is built ONLY from URL
const buildTrailFromLocation = (pathname, search) => {
  const params = new URLSearchParams(search || '');
  const trail = [{ label: 'Home', to: '/' }];

  // product handled separately
  if (pathname.startsWith('/product/')) return trail;

  // static pages
  if (STATIC_ROUTES[pathname]) {
    trail.push(STATIC_ROUTES[pathname]);
    return trail;
  }

  // WOMEN root
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

  // UNSTITCHED: type/style/pieces from URL
  if (pathname === '/unstitched') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Unstitched', to: '/unstitched' });

    const type = params.get('type'); // winter/printed/embroidered/velvet
    const style = params.get('style'); // PRINTED/SIGNATURE/GLAM/DAILYWEAR
    const pieces = params.get('pieces'); // 3 Piece etc

    if (type) {
      trail.push({
        label: titleCase(type),
        to: `/unstitched?type=${encodeURIComponent(type)}`,
      });
    }
    if (style) {
      trail.push({
        label: titleCase(style),
        to: `/unstitched?type=${encodeURIComponent(type || '')}&style=${encodeURIComponent(style)}`,
      });
    }
    if (pieces) {
      trail.push({
        label: titleCase(pieces),
        to: `/unstitched?type=${encodeURIComponent(type || '')}&style=${encodeURIComponent(style || '')}&pieces=${encodeURIComponent(pieces)}`,
      });
    }
    return trail;
  }

  // READY TO WEAR: type/sub from URL
  if (pathname === '/ready-to-wear') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Ready To Wear', to: '/ready-to-wear' });

    const type = params.get('type'); // embroidered/printed...
    const sub = params.get('sub'); // Casual / Semi Formal...

    if (type) {
      trail.push({
        label: titleCase(type),
        to: `/ready-to-wear?type=${encodeURIComponent(type)}`,
      });
    }
    if (sub) {
      trail.push({
        label: titleCase(sub),
        to: `/ready-to-wear?type=${encodeURIComponent(type || '')}&sub=${encodeURIComponent(sub)}`,
      });
    }
    return trail;
  }

  // ACCESSORIES: cat/sub from URL
  if (pathname === '/accessories') {
    trail.push({ label: 'Women', to: '/women' });
    trail.push({ label: 'Accessories', to: '/accessories' });

    const cat = params.get('cat'); // jewellery/shawls/hair-accessories
    const sub = params.get('sub'); // Earrings etc

    if (cat) {
      trail.push({
        label: titleCase(cat),
        to: `/accessories?cat=${encodeURIComponent(cat)}`,
      });
    }
    if (sub) {
      trail.push({
        label: titleCase(sub),
        to: `/accessories?cat=${encodeURIComponent(cat || '')}&sub=${encodeURIComponent(sub)}`,
      });
    }
    return trail;
  }

  // MEN: section/category from URL
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
        ? `/men?section=${encodeURIComponent(section)}&category=${encodeURIComponent(category)}`
        : `/men?category=${encodeURIComponent(category)}`;

      trail.push({ label: titleCase(category), to });
    }
    return trail;
  }

  // fallback
  const parts = pathname.split('/').filter(Boolean);
  let current = '';
  for (const p of parts) {
    current += `/${p}`;
    trail.push({ label: titleCase(p), to: current });
  }
  return trail;
};

export default function Breadcrumbs() {
  // ✅ HOOKS ALWAYS ON TOP (fixes hook order error)
  const location = useLocation();
  const { pathname, search } = location;
  const { id } = useParams();
  const { products: allProducts = [] } = useProducts() || {};

  const hide =
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/admin');

  const product = useMemo(() => {
    if (!id) return null;
    return (allProducts || []).find((p) => String(p.id) === String(id)) || null;
  }, [allProducts, id]);

  // ✅ save trail on every NON-product page
  useEffect(() => {
    if (hide) return;
    if (pathname.startsWith('/product/')) return;

    const trail = buildTrailFromLocation(pathname, search);
    if (trail.length > 1) {
      try {
        sessionStorage.setItem('vv_trail', JSON.stringify(trail));
      } catch {}
    }
  }, [pathname, search, hide]);

  const crumbs = useMemo(() => {
    if (hide) return [];

    // PRODUCT PAGE
    if (pathname.startsWith('/product/')) {
      const savedTrail = safeParse(
        sessionStorage.getItem('vv_trail') || 'null'
      );
      const base =
        Array.isArray(savedTrail) && savedTrail.length
          ? savedTrail
          : [{ label: 'Home', to: '/' }];

      const list = [...base];

      const pushUnique = (label, to) => {
        if (!label) return;
        const exists = list.some(
          (x) => String(x.label).toLowerCase() === String(label).toLowerCase()
        );
        if (!exists) list.push({ label, to });
      };

      // if user opened product directly, try to build from product fields too
      if (product) {
        const mc = String(product.mainCategory || '')
          .toUpperCase()
          .trim();
        const cat = String(product.category || '')
          .toLowerCase()
          .trim();

        // UNSTITCHED
        if (mc === 'UNSTITCHED') {
          const type =
            product.unstitchedType ||
            product.unstitched_type ||
            product.type ||
            '';
          const style =
            product.unstitchedStyle ||
            product.unstitched_style ||
            product.style ||
            '';
          const pieces =
            product.pieces || product.noOfPieces || product.no_of_pieces || '';

          pushUnique('Women', '/women');
          pushUnique('Unstitched', '/unstitched');

          if (type)
            pushUnique(
              titleCase(type),
              `/unstitched?type=${encodeURIComponent(String(type).toLowerCase())}`
            );
          if (style)
            pushUnique(
              titleCase(style),
              `/unstitched?type=${encodeURIComponent(String(type).toLowerCase())}&style=${encodeURIComponent(style)}`
            );
          if (pieces)
            pushUnique(
              titleCase(pieces),
              `/unstitched?type=${encodeURIComponent(String(type).toLowerCase())}&style=${encodeURIComponent(style)}&pieces=${encodeURIComponent(pieces)}`
            );
        }

        // READY TO WEAR
        if (mc === 'READY_TO_WEAR') {
          const type = product.rtwType || product.rtw_type || '';
          const sub = product.rtwSubType || product.rtw_sub_type || '';

          pushUnique('Women', '/women');
          pushUnique('Ready To Wear', '/ready-to-wear');

          if (type)
            pushUnique(
              titleCase(type),
              `/ready-to-wear?type=${encodeURIComponent(String(type).toLowerCase())}`
            );
          if (sub)
            pushUnique(
              titleCase(sub),
              `/ready-to-wear?type=${encodeURIComponent(String(type).toLowerCase())}&sub=${encodeURIComponent(sub)}`
            );
        }

        // ACCESSORIES
        if (mc === 'ACCESSORIES') {
          const main = product.mainCategory; // ACCESSORIES (not helpful)
          const acc = product.accessoryType || product.accessory_type || ''; // JEWELLRY/...
          const sub = product.subCategory || product.sub_category || '';

          const catUrl = String(acc || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-');

          pushUnique('Women', '/women');
          pushUnique('Accessories', '/accessories');
          if (acc)
            pushUnique(
              titleCase(acc),
              `/accessories?cat=${encodeURIComponent(catUrl)}`
            );
          if (sub)
            pushUnique(
              titleCase(sub),
              `/accessories?cat=${encodeURIComponent(catUrl)}&sub=${encodeURIComponent(sub)}`
            );
        }

        // MEN
        if (cat === 'men' || mc === 'MENSWEAR') {
          const section = product.section || 'menswear';
          const menCat =
            product.subCategory ||
            product.sub_category ||
            product.menCategory ||
            '';

          pushUnique('Men', '/men');
          if (section)
            pushUnique(
              titleCase(section),
              `/men?section=${encodeURIComponent(section)}`
            );
          if (menCat)
            pushUnique(
              titleCase(menCat),
              `/men?section=${encodeURIComponent(section)}&category=${encodeURIComponent(
                String(menCat).toLowerCase().replace(/\s+/g, '-')
              )}`
            );
        }
      }

      // product last
      pushUnique(
        titleCase(product?.title || product?.name || 'Product'),
        pathname
      );
      return list;
    }

    // NORMAL PAGE
    return buildTrailFromLocation(pathname, search);
  }, [pathname, search, product, hide]);

  // ✅ NOW it's safe to return null (after hooks)
  if (hide) return null;

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
