import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      // Check role from result or fallback to email check
      const role =
        result.role ||
        (email.toLowerCase() === 'admin@mystore.com' ? 'admin' : 'user');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      console.error('Login Failed Result:', result); // Debugging log
      let msg = result.message;
      if (msg && msg.includes('Email not confirmed')) {
        msg =
          'Please verify your email address. Check your inbox (and spam folder) for the confirmation link.';
      } else if (msg && msg.includes('Invalid login credentials')) {
        msg = 'Invalid email or password. Please try again.';
      }
      setError(msg || 'Login failed. Please check console for details.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
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

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />



            <button type="submit" className="login-btn">
              Log In
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={async () => {
                const res = await loginWithGoogle();
                if (!res.success) setError(res.message);
              }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
              />
              Sign in with Google
            </button>
          </form>

          <div
            className="login-footer"
            style={{ marginTop: '1rem', textAlign: 'center' }}
          >
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
