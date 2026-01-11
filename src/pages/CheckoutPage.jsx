// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css'; // ✅ NEW css file

import emailjs from '@emailjs/browser';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    address: '',
    city: '',
    phone: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const DELIVERY_CHARGES = 200;

  const subTotal = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  const totalAmount = subTotal + DELIVERY_CHARGES - discount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE10') {
      const disc = Math.round(subTotal * 0.1);
      setDiscount(disc);
      alert(`Promo Applied! You saved PKR ${disc}`);
    } else if (promoCode.trim().toUpperCase() === 'FLAT500') {
      const disc = 500;
      setDiscount(disc);
      alert('Promo Applied! You saved PKR 500');
    } else {
      alert('Invalid Promo Code');
      setDiscount(0);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      navigate('/');
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        alert('Please login to place an order.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      const orderData = {
        user_id: user.id,
        total_amount: totalAmount,
        status: 'Pending',
        items: cart,
        shipping_address: formData,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;

      // --- SEND EMAIL (EmailJS) ---
      // NOTE: Replace these with your actual Service ID, Template ID, and Public Key
      const SERVICE_ID = 'service_oz5is8d'; // Example ID, User needs to replace
      const TEMPLATE_ID = 'template_w1m8m6l'; // Example ID
      const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Example Key

      try {
        // Verify if keys are placeholders
        if (SERVICE_ID !== 'YOUR_SERVICE_ID') {
          await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
              order_id: data[0].id,
              to_name: formData.fullName,
              to_email: formData.email,
              total: totalAmount,
              message: "Your order has been booked successfully!",
            },
            PUBLIC_KEY
          );
          console.log("Email sent successfully");
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        // Don't block the UI flow if email fails
      }
      // ----------------------------

      clearCart();
      alert(`Order placed successfully! Order ID: ${data?.[0]?.id}`);
      navigate('/home');
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button className="checkout-empty-btn" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-grid">
        {/* LEFT: FORM */}
        <div className="checkout-form-container">
          <h3 className="checkout-subtitle">Shipping Details</h3>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-field">
              <label>Full Name *</label>
              <input
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
              />
            </div>

            <div className="checkout-field">
              <label>Email *</label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
            </div>

            <div className="checkout-field">
              <label>Address *</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
                placeholder="House #, Street, Block..."
              />
            </div>

            <div className="checkout-row-2">
              <div className="checkout-field">
                <label>City *</label>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  type="text"
                />
              </div>

              <div className="checkout-field">
                <label>Phone *</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={loading}
            >
              {loading
                ? 'Placing Order...'
                : `Place Order (PKR ${totalAmount.toLocaleString()})`}
            </button>
          </form>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="checkout-summary">
          <h3 className="checkout-subtitle">Order Summary</h3>

          <div className="checkout-items">
            {cart.map((item) => (
              <div
                className="checkout-item"
                key={`${item.id}-${item.size || ''}`}
              >
                <div className="checkout-item-left">
                  <div className="checkout-item-img">
                    <img src={item.image} alt={item.name || 'product'} />
                  </div>

                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.name}</p>
                    <small className="checkout-item-qty">
                      Qty: {item.qty}
                      {item.size ? ` • Size: ${item.size}` : ''}
                    </small>
                  </div>
                </div>

                <span className="checkout-item-price">
                  PKR{' '}
                  {(
                    Number(item.price || 0) * Number(item.qty || 0)
                  ).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-row">
              <span>Subtotal</span>
              <span>PKR {subTotal.toLocaleString()}</span>
            </div>

            <div className="checkout-row">
              <span>Delivery Charges</span>
              <span>PKR {DELIVERY_CHARGES}</span>
            </div>

            {discount > 0 && (
              <div className="checkout-row discount-row" style={{ color: 'green' }}>
                <span>Discount</span>
                <span>- PKR {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="checkout-row checkout-total">
              <span>Total</span>
              <span>PKR {totalAmount.toLocaleString()}</span>
            </div>

            {/* Promo Code Input */}
            <div className="promo-section" style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                style={{
                  padding: '8px 12px',
                  background: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
