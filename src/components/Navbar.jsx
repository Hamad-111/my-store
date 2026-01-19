import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

const WOMEN_MENU = {
  unstitched: {
    title: 'UNSTITCHED',
    mainLink: '/unstitched',
    defaultImage: '/images/embroidary1.jfif',
    items: [
      {
        label: 'Winter',
        image: '/images/winter.jfif',
        link: '/unstitched?type=winter',
      },
      {
        label: 'Printed',
        image: '/images/printed1.jfif',
        link: '/unstitched?type=printed',
      },
      {
        label: 'Embroidered',
        image: '/images/embroidary2.jfif',
        link: '/unstitched?type=embroidered',
      },
      {
        label: 'Velvet',
        image: '/images/valvet.jfif',
        link: '/unstitched?type=velvet',
      },
    ],
  },
  readyToWear: {
    title: 'READY TO WEAR',
    mainLink: '/ready-to-wear',
    defaultImage: '/images/cords1.jfif',
    items: [
      {
        label: 'Embroidered',
        image: '/images/embroidary3.jfif',
        link: '/ready-to-wear?type=embroidered',
      },
      {
        label: 'Printed',
        image: '/images/printed2.jfif',
        link: '/ready-to-wear?type=printed',
      },
      {
        label: 'Solids',
        image: '/images/solid.jfif',
        link: '/ready-to-wear?type=solids',
      },
      {
        label: 'Co-ords',
        image: '/images/Coords.jfif',
        link: '/ready-to-wear?type=coords',
      },
      {
        label: 'Formals',
        image: '/images/formal.jfif',
        link: '/ready-to-wear?type=formals',
      },
      {
        label: 'Kurtis',
        image: '/images/kurtis4.jfif',
        link: '/ready-to-wear?type=kurtis',
      },
      {
        label: 'Bottoms',
        image: '/images/womenbottom.jfif',
        link: '/ready-to-wear?type=bottoms',
      },
    ],
  },
  accessories: {
    title: 'ACCESSORIES',
    mainLink: '/accessories',
    defaultImage: '/images/jewl.jfif',
    items: [
      {
        label: 'Jewellery',
        image: '/images/jewl.jfif',
        link: '/accessories?cat=jewellery',
      },
      {
        label: 'Shawls',
        image: '/images/womenshawl1.jfif',
        link: '/accessories?cat=shawls',
      },
      {
        label: 'Hair Accessories',
        image: '/images/scarf.jfif',
        link: '/accessories?cat=hair-accessories',
      },
    ],
  },
};

const MEN_MENU = {
  menswear: {
    title: 'MENSWEAR',
    mainLink: '/men?section=menswear',
    defaultImage: '/images/menshirt5.jfif',
    items: [
      {
        label: 'Kurta',
        image: '/images/menkurti5.jfif',
        link: '/men?section=menswear&category=kurta',
      },
      {
        label: 'Shalwar Kameez',
        image: '/images/menunstitched1.jfif',
        link: '/men?section=menswear&category=shalwar-kameez',
      },
      {
        label: 'Shirts',
        image: '/images/menshirt1.jfif',
        link: '/men?section=menswear&category=shirts',
      },
    ],
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { products: allProducts = [] } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [openMega, setOpenMega] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({
    women: false,
    men: false,
  });

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  const hideSecondaryNav =
    routerLocation.pathname === '/login' ||
    routerLocation.pathname === '/signup';

  const defaultWomenImage = WOMEN_MENU.unstitched.defaultImage;
  const defaultMenImage = MEN_MENU.menswear.defaultImage;
  const { user } = useAuth(); // import useAuth

  const goCart = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { pulse: true } });
    navigate('/cart');
  };

  const goLoginPulse = (e) => {
    e.preventDefault();

    // ✅ already on login page? do not re-trigger pulse
    if (routerLocation.pathname === '/login') return;

    navigate('/login', { state: { pulse: true } });
  };

  const closeAll = useCallback(() => {
    setOpenMega(null);
    setPreviewImage(null);
    setSuggestions([]);
    setShowMobileMenu(false);
    setShowSearchOverlay(false);
  }, []);

  useEffect(() => {
    closeAll();
  }, [routerLocation.pathname, closeAll]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const lowerQ = searchQuery.toLowerCase();
    const matches = allProducts.filter((p) => {
      const title = String(p?.title || p?.name || '').toLowerCase();
      const brand = String(p?.brand || '').toLowerCase();
      return title.includes(lowerQ) || brand.includes(lowerQ);
    });
    setSuggestions(matches.slice(0, 6));
  }, [searchQuery, allProducts]);

  const safeImg = useCallback((p) => {
    return (
      p?.image ||
      (Array.isArray(p?.images) && p.images[0]) ||
      '/images/placeholder.png'
    );
  }, []);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSuggestions([]);
    setShowSearchOverlay(false);
    setOpenMega(null);
  }, [navigate, searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSuggestionClick = (prodId) => {
    navigate(`/product/${prodId}`);
    setSearchQuery('');
    setSuggestions([]);
    setShowSearchOverlay(false);
    setOpenMega(null);
  };

  const openWomenMega = () => {
    setOpenMega('women');
    setPreviewImage(defaultWomenImage);
  };

  const openMenMega = () => {
    setOpenMega('men');
    setPreviewImage(defaultMenImage);
  };

  const handleItemClick = (link) => {
    if (!link) return;
    navigate(link);
    setOpenMega(null);
    setPreviewImage(null);
  };

  const toggleExpand = (key) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mobileIcon = (isOpen) =>
    isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />;

  return (
    <>
      <header className="nav-wrapper">
        <div className="nav-container">
          <div className="nav-left">
            <button
              className="mobile-hamburger"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={22} />
            </button>

            <Link to="/home" className="brand">
              <img
                src="/images/logo3.png"
                alt="VestiVistora"
                className="brand-logo"
              />
            </Link>
          </div>

          <div className="nav-center">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Search
                size={18}
                className="search-icon"
                onClick={handleSearch}
              />
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(s.id)}
                    >
                      <img
                        src={safeImg(s)}
                        alt={s.title || s.name}
                        className="suggestion-img"
                      />
                      <div className="suggestion-info">
                        <p className="suggestion-title">{s.title || s.name}</p>
                        <p className="suggestion-price">PKR {s.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="nav-actions">
            {/* ✅ WISHLIST */}
            <div className="wishlist-wrapper">
              <a
                href="/wishlist"
                className="icon-btn"
                onClick={(e) => {
                  if (!user) return goLoginPulse(e);
                  e.preventDefault();
                  navigate('/wishlist');
                }}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart size={20} />
              </a>

              {wishlist?.length > 0 && (
                <span className="wishlist-badge">{wishlist.length}</span>
              )}
            </div>

            {/* ✅ USER / LOGIN */}
            <a
              href="/login"
              className="icon-btn"
              onClick={goLoginPulse}
              aria-label="Login"
              title="Login"
            >
              <User size={20} />
            </a>

            {/* ✅ CART */}
            <div className="cart-wrapper">
              <a
                href="/cart"
                className="icon-btn"
                onClick={goCart}
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart size={20} />
              </a>

              {cart?.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {!hideSecondaryNav && (
        <div className="secondary-nav">
          <div className="main-menu-wrapper">
            <ul className="main-menu">
              <li onMouseEnter={() => setOpenMega(null)}>
                <Link to="/home" className="main-menu-link">
                  Home
                </Link>
              </li>

              <li
                onMouseEnter={openWomenMega}
                onMouseLeave={() => setOpenMega(null)}
              >
                <button
                  type="button"
                  className="main-menu-link"
                  onClick={() => {
                    navigate('/women');
                    setOpenMega(null);
                  }}
                >
                  Women
                </button>

                {openMega === 'women' && (
                  <div className="mega-menu">
                    <div className="mega-inner">
                      <div className="mega-columns">
                        {Object.values(WOMEN_MENU).map((col) => (
                          <div
                            key={col.title}
                            className="mega-col"
                            onMouseEnter={() =>
                              setPreviewImage(
                                col.defaultImage || defaultWomenImage
                              )
                            }
                          >
                            <button
                              type="button"
                              className="mega-heading-btn"
                              onClick={() => handleItemClick(col.mainLink)}
                            >
                              {col.title}
                            </button>

                            {col.items.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                className="mega-link"
                                onMouseEnter={() =>
                                  setPreviewImage(
                                    item.image ||
                                      col.defaultImage ||
                                      defaultWomenImage
                                  )
                                }
                                onClick={() => handleItemClick(item.link)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="mega-image">
                        <img
                          src={previewImage || defaultWomenImage}
                          alt="Women preview"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li
                onMouseEnter={openMenMega}
                onMouseLeave={() => setOpenMega(null)}
              >
                <button
                  type="button"
                  className="main-menu-link"
                  onClick={() => {
                    navigate('/men');
                    setOpenMega(null);
                  }}
                >
                  Men
                </button>

                {openMega === 'men' && (
                  <div className="mega-menu">
                    <div className="mega-inner">
                      <div className="mega-columns">
                        {Object.values(MEN_MENU).map((col) => (
                          <div
                            key={col.title}
                            className="mega-col"
                            onMouseEnter={() =>
                              setPreviewImage(
                                col.defaultImage || defaultMenImage
                              )
                            }
                          >
                            <button
                              type="button"
                              className="mega-heading-btn"
                              onClick={() => handleItemClick(col.mainLink)}
                            >
                              {col.title}
                            </button>

                            {col.items.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                className="mega-link"
                                onMouseEnter={() =>
                                  setPreviewImage(
                                    item.image ||
                                      col.defaultImage ||
                                      defaultMenImage
                                  )
                                }
                                onClick={() => handleItemClick(item.link)}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="mega-image">
                        <img
                          src={previewImage || defaultMenImage}
                          alt="Men preview"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li onMouseEnter={() => setOpenMega(null)}>
                <Link to="/brand" className="main-menu-link">
                  Brand
                </Link>
              </li>

              <li onMouseEnter={() => setOpenMega(null)}>
                <Link to="/contact" className="main-menu-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {showSearchOverlay && (
        <div
          className="search-overlay"
          onClick={() => setShowSearchOverlay(false)}
        >
          <div
            className="search-overlay-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-overlay-top">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <Search
                  size={18}
                  className="search-icon"
                  onClick={handleSearch}
                />
                {suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(s.id)}
                      >
                        <img
                          src={safeImg(s)}
                          alt={s.title || s.name}
                          className="suggestion-img"
                        />
                        <div className="suggestion-info">
                          <p className="suggestion-title">
                            {s.title || s.name}
                          </p>
                          <p className="suggestion-price">PKR {s.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowSearchOverlay(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showMobileMenu && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      <div className={`mobile-menu-drawer ${showMobileMenu ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu</span>
          <button
            className="mobile-close-btn"
            onClick={() => setShowMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li className="mobile-nav-item">
            <Link
              to="/home"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
          </li>

          <li className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => toggleExpand('women')}
            >
              <span>Women</span>
              {mobileIcon(mobileExpanded.women)}
            </div>

            {mobileExpanded.women && (
              <div className="mobile-submenu">
                <Link
                  to="/unstitched"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Unstitched
                </Link>
                <Link
                  to="/ready-to-wear"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Ready to Wear
                </Link>
                <Link
                  to="/accessories"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Accessories
                </Link>
              </div>
            )}
          </li>

          <li className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => toggleExpand('men')}
            >
              <span>Men</span>
              {mobileIcon(mobileExpanded.men)}
            </div>

            {mobileExpanded.men && (
              <div className="mobile-submenu">
                <Link
                  to="/men"
                  className="mobile-nav-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Menswear
                </Link>
              </div>
            )}
          </li>

          <li className="mobile-nav-item">
            <Link
              to="/brand"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Brand
            </Link>
          </li>

          <li className="mobile-nav-item">
            <Link
              to="/contact"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
