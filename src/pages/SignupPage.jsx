import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css'; // Reusing Login styles for consistency

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await signup(email, password, name);
        if (result.success) {
            alert('Signup successful! Please check your email to verify your account before logging in.');
            navigate('/login');
        } else {
            setError(result.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-image">
                    <img src="/images/loginbanner.png" alt="signup illustration" />
                </div>

                <div className="login-content">
                    <h2 className="login-title">Create an Account</h2>
                    <p className="login-subtext">
                        Join us for a faster checkout and exclusive offers.
                    </p>

                    {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="login-input"
                            required
                        />
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
                            Sign Up
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Already have an account? <Link to="/login">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
