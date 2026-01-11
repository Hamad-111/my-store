// src/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { Heart, User, ShoppingCart, Search, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext'; // Import ProductContext

import LocationSelector from '../components/LocationSelector';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLocation, setSelectedLocation] = useState('Pakistan');

  const [showLocationBox, setShowLocationBox] = useState(false);

  const [openMega, setOpenMega] = useState(null); // 'women' | 'men' | null
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ MOBILE MENU STATE
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({}); // { women: true, men: false ... }

  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const hideSecondaryNav =
    routerLocation.pathname === '/login' ||
    routerLocation.pathname === '/signup';

  // --------- WOMEN MENU DATA (columns + images) ----------
  const womenMenu = {
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

  // --------- MEN MENU DATA ----------
  const menMenu = {
    menswear: {
      title: 'MENSWEAR',
      mainLink: '/men?section=menswear', // ✅ menswear banner
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

  const defaultWomenImage = womenMenu.unstitched.defaultImage;
  const defaultMenImage = menMenu.menswear.defaultImage;

  const openWomenMega = () => {
    setOpenMega('women');
    setPreviewImage(defaultWomenImage);
  };

  const openMenMega = () => {
    setOpenMega('men');
    setPreviewImage(defaultMenImage);
  };

  const closeMega = () => {
    setOpenMega(null);
    setPreviewImage(null);
  };

  const handleItemClick = (link) => {
    if (link) {
      navigate(link);
      closeMega();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowLocationBox(false); // Close other popups if open
      closeMega();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --------- SUGGESTIONS LOGIC ----------
  const { products: allProducts } = useProducts();
  const [suggestions, setSuggestions] = useState([]);

  // Filter suggestions when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const lowerQ = searchQuery.toLowerCase();
    const matches = allProducts.filter((p) => {
      const title = (p.title || p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      // Match title or brand
      return title.includes(lowerQ) || brand.includes(lowerQ);
    });
    // Limit to top 5
    setSuggestions(matches.slice(0, 5));
  }, [searchQuery, allProducts]);

  const handleSuggestionClick = (prodId) => {
    navigate(`/product/${prodId}`);
    setSuggestions([]);
    setSearchQuery('');
    closeMega();
  };

  return (
    <>
      {/* ========= TOP NAVBAR (unchanged look) ========= */}
      <header className="nav-wrapper">
        <div className="nav-container">
          {/* Left: Brand */}
          <div className="nav-left">
            <button
              className="mobile-hamburger"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu size={24} />
            </button>
            <Link to="/home" className="brand">
              <img
                src="/images/logo1.png" // 🔥 yahan apna logo path do
                alt="VestiVistora"
                className="brand-logo"
              />
            </Link>
          </div>

          {/* Middle: Location + Search */}
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
                style={{ cursor: 'pointer' }}
              />

              {/* SUGGESTIONS DROPDOWN */}
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(s.id)}
                    >
                      <img
                        src={s.image}
                        alt={s.title}
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

          {/* Right: Icons */}
          <div className="nav-actions">
            <div className="wishlist-wrapper">
              <Link to="/wishlist" className="icon-btn">
                <Heart size={20} />
              </Link>
              {wishlist.length > 0 && (
                <span className="wishlist-badge">{wishlist.length}</span>
              )}
            </div>

            <Link to="/login" className="icon-btn">
              <User size={20} />
            </Link>

            <div className="cart-wrapper">
              <Link to="/cart" className="icon-btn">
                <ShoppingCart size={20} />
              </Link>
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========= SECONDARY NAV: HOME / WOMEN / MEN / BRAND / CONTACT ========= */}
      {!hideSecondaryNav && (
        <div className="secondary-nav">
          <div className="main-menu-wrapper">
            <ul className="main-menu">
              <li onMouseEnter={closeMega}>
                <Link to="/home" className="main-menu-link">
                  Home
                </Link>
              </li>

              {/* WOMEN (mega menu on hover) */}
              <li
                className="has-mega"
                onMouseEnter={openWomenMega}
                onMouseLeave={closeMega}
              >
                <button
                  type="button"
                  className="main-menu-link"
                  onClick={() => {
                    navigate('/women'); // 🔥 open women page
                    closeMega(); // close dropdown
                  }}
                >
                  Women
                </button>

                {openMega === 'women' && (
                  <div className="mega-menu">
                    <div className="mega-inner">
                      <div className="mega-columns">
                        {Object.values(womenMenu).map((col) => (
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

              {/* MEN (mega menu on hover) */}
              <li
                className="has-mega"
                onMouseEnter={openMenMega}
                onMouseLeave={closeMega}
              >
                <button
                  type="button"
                  className="main-menu-link"
                  onClick={() => {
                    navigate('/men'); // ✅ MEN banner
                    closeMega();
                  }}
                >
                  Men
                </button>

                {openMega === 'men' && (
                  <div className="mega-menu">
                    <div className="mega-inner">
                      <div className="mega-columns">
                        {Object.values(menMenu).map((col) => (
                          <div
                            key={col.title}
                            className="mega-col"
                            onMouseEnter={() =>
                              setPreviewImage(
                                col.defaultImage || defaultMenImage
                              )
                            }
                          >
                            {/* 🔥 MENSWEAR / ACCESSORIES heading click se page open hoga */}
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

              {/* BRAND (simple link) */}
              <li>
                <Link to="/brand" className="main-menu-link">
                  Brand
                </Link>
              </li>

              {/* CONTACT (simple link) */}

              <li onMouseEnter={closeMega}>
                <Link to="/contact" className="main-menu-link">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ========= LOCATION POPUP ========= */}
      {showLocationBox && (
        <LocationSelector
          onClose={() => setShowLocationBox(false)}
          onSelect={(city) => {
            setSelectedLocation(city);
            setShowLocationBox(false);
          }}
        />
      )}
      {/* ========= MOBILE MENU DRAWER ========= */}
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
            <X size={24} />
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

          {/* WOMEN Accordion */}
          <li className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => setMobileExpanded(prev => ({ ...prev, women: !prev.women }))}
              style={{ cursor: 'pointer' }}
            >
              <span>Women</span>
              {mobileExpanded.women ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {mobileExpanded.women && (
              <div style={{ background: '#fcfcfc', paddingLeft: '20px' }}>
                <Link to="/unstitched" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)} >Unstitched</Link>
                <Link to="/ready-to-wear" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)} >Ready to Wear</Link>
                <Link to="/accessories" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)} >Accessories</Link>
              </div>
            )}
          </li>

          {/* MEN Accordion */}
          <li className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => setMobileExpanded(prev => ({ ...prev, men: !prev.men }))}
              style={{ cursor: 'pointer' }}
            >
              <span>Men</span>
              {mobileExpanded.men ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {mobileExpanded.men && (
              <div style={{ background: '#fcfcfc', paddingLeft: '20px' }}>
                <Link to="/men" className="mobile-nav-link" onClick={() => setShowMobileMenu(false)} >Menswear</Link>
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
