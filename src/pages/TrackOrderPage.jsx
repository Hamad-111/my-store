import React, { useState } from 'react';
import './Policies.css';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [status, setStatus] = useState(null);

    const handleTrack = (e) => {
        e.preventDefault();
        // Mock tracking logic
        if (orderId.trim()) {
            setStatus('Processing');
        }
    };

    return (
        <div className="policy-page">
            <h1 className="policy-title">Track Your Order</h1>

            <div className="track-order-container">
                <p>Enter your Order ID to see the current status of your shipment.</p>

                <form onSubmit={handleTrack} className="track-input-group">
                    <input
                        type="text"
                        placeholder="Order ID (e.g., #ORD-1234)"
                        className="track-input"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        required
                    />
                    <button type="submit" className="track-btn">Track</button>
                </form>

                {status && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1' }}>
                        <h3>Status: {status}</h3>
                        <p>Your order is currently being prepared for shipment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
