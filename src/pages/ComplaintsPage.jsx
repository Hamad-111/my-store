import React, { useState } from 'react';
import './Policies.css';

export default function ComplaintsPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="policy-page" style={{ textAlign: 'center' }}>
                <h1 className="policy-title">Complaint Submitted</h1>
                <p>Thank you for bringing this to our attention. Our team will review your complaint and get back to you within 24-48 hours.</p>
                <button onClick={() => setSubmitted(false)} className="submit-btn" style={{ maxWidth: '200px', margin: '2rem auto' }}>Submit Another</button>
            </div>
        );
    }

    return (
        <div className="policy-page">
            <h1 className="policy-title">File a Complaint</h1>
            <div className="form-container">
                <p style={{ marginBottom: '2rem', textAlign: 'center' }}>We take your concerns seriously. Please fill out the form below.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Order ID (if applicable)</label>
                        <input type="text" className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Complaint Details</label>
                        <textarea className="form-textarea" required placeholder="Describe your issue..."></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Submit Complaint</button>
                </form>
            </div>
        </div>
    );
}
