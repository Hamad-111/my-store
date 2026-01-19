// ✅ src/pages/SignupPage.jsx (REWRITE - CLEAN + CORRECT)
//
// Goals:
// 1) Guest user signup kare -> usko /login pe bhejo (pulse)
// 2) Pending actions pop NA karo (email verification possible)
// 3) If pending exists -> user ko clear message show karo
// 4) Prevent double submit, basic validation, safer navigation

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';
import { hasPendingActions } from '../utils/pendingActions';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [pulseOnce, setPulseOnce] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pendingExists = useMemo(() => hasPendingActions(), []);

  // ✅ pulse animation once
  useEffect(() => {
    if (!location.state?.pulse) return;

    setPulseOnce(true);

    // clear state so it doesn't blink again
    navigate(location.pathname, { replace: true, state: {} });

    const t = setTimeout(() => setPulseOnce(false), 1100);
    return () => clearTimeout(t);
  }, [location.state, location.pathname, navigate]);

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email.';
    if (String(password).length < 6)
      return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError('');
    setInfo('');

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);

    try {
      const result = await signup(email.trim(), password, name.trim());

      if (!result?.success) {
        setError(result?.message || 'Signup failed. Please try again.');
        return;
      }

      // ✅ do NOT pop pending here (email verification possible)
      const pendingNow = hasPendingActions();

      setInfo(
        pendingNow
          ? 'Signup successful! Now log in. Your selected product will be added automatically after login.'
          : 'Signup successful! Now log in.'
      );

      // ✅ go to login (pulse highlight)
      navigate('/login', {
        replace: true,
        state: { pulse: true },
      });
    } catch (err) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${pulseOnce ? 'pulse' : ''}`}>
        <div className="login-image">
          <img src="/images/loginbanner.png" alt="signup illustration" />
        </div>

        <div className="login-content">
          <h2 className="login-title">Create an Account</h2>
          <p className="login-subtext">
            Join us for a faster checkout and exclusive offers.
          </p>

          {pendingExists && !info && !error && (
            <p className="info-text" style={{ color: 'green' }}>
              Your selected product will be saved and added automatically after
              login.
            </p>
          )}

          {error && (
            <p
              className="error-text"
              style={{ color: 'red', marginBottom: 10 }}
            >
              {error}
            </p>
          )}

          {info && (
            <p
              className="info-text"
              style={{ color: 'green', marginBottom: 10 }}
            >
              {info}
            </p>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
              required
              autoComplete="name"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              autoComplete="new-password"
            />

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div
            className="login-footer"
            style={{ marginTop: '1rem', textAlign: 'center' }}
          >
            <p>
              Already have an account?{' '}
              <Link to="/login" state={{ pulse: true }}>
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
