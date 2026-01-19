// ✅ src/pages/LoginPage.jsx (with loading UX)

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { popAllPendingActions } from '../utils/pendingActions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState('');
  const [pulseOnce, setPulseOnce] = useState(false);

  // ✅ NEW: loading state
  const [submitting, setSubmitting] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { products: allProducts = [] } = useProducts() || {};

  useEffect(() => {
    if (location.state?.pulse) {
      setPulseOnce(true);
      navigate(location.pathname, { replace: true, state: {} });

      const t = setTimeout(() => setPulseOnce(false), 1100);
      return () => clearTimeout(t);
    }
  }, [location.state, location.pathname, navigate]);

  const findProductById = (pid) =>
    (allProducts || []).find((p) => String(p.id) === String(pid)) || null;

  const applyPendingActionsAndGetRedirect = () => {
    const pending = popAllPendingActions();
    if (!Array.isArray(pending) || pending.length === 0) return '/';

    let goTo = '/';

    for (const act of pending) {
      if (!act?.type) continue;

      const fromList = findProductById(act.productId);
      const snap = act.snapshot || {};
      const source = fromList || snap;

      if (!source?.id) continue;

      if (act.type === 'ADD_TO_CART') {
        addToCart({
          id: String(source.id),
          name: source.title || source.name || 'Product',
          brand: source.brand || '',
          image: source.image || '',
          price: Number(source.price || 0),
          salePercent: Number(source.salePercent || 0),
          originalPrice: Number(source.originalPrice || source.price || 0),
          qty: Number(act.qty || 1),
          size: act.size || null,
        });
        goTo = act.redirectBack || '/cart';
      }

      if (act.type === 'ADD_TO_WISHLIST') {
        addToWishlist({
          id: String(source.id),
          name: source.title || source.name || 'Product',
          brand: source.brand || '',
          image: source.image || '',
          price: Number(source.price || 0),
          salePercent: Number(source.salePercent || 0),
          originalPrice: Number(source.originalPrice || source.price || 0),
          size: act.size || null,
        });
        goTo = act.redirectBack || '/wishlist';
      }
    }

    return goTo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // ✅ prevent double click

    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);

      if (!result?.success) {
        let msg = result?.message;

        if (msg && msg.includes('Email not confirmed')) {
          msg =
            'Please verify your email address. Check your inbox (and spam folder) for the confirmation link.';
        } else if (msg && msg.includes('Invalid login credentials')) {
          msg = 'Invalid email or password. Please try again.';
        }

        setError(msg || 'Login failed.');
        return;
      }

      const role =
        result.role ||
        (email.toLowerCase() === 'admin@mystore.com' ? 'admin' : 'user');

      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      const goTo = applyPendingActionsAndGetRedirect();
      navigate(goTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${pulseOnce ? 'pulse' : ''}`}>
        <div className="login-image">
          <img src="/images/loginbanner.png" alt="login illustration" />
        </div>

        <div className="login-content">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtext">
            Sign in to access your account and orders.
          </p>

          {error && (
            <p
              className="error-text"
              style={{ color: 'red', marginBottom: '1rem' }}
            >
              {error}
            </p>
          )}

          {/* ✅ Optional: small status line */}
          {submitting && (
            <p
              className="info-text"
              style={{ color: '#2b653a', marginBottom: 10 }}
            >
              Logging you in…
            </p>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              disabled={submitting}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              disabled={submitting}
            />

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Logging in...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div
            className="login-footer"
            style={{ marginTop: '1rem', textAlign: 'center' }}
          >
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/signup" state={{ pulse: true }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div >
      </div >
    </div >
  );
}
