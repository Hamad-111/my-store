import React, { useState } from 'react';
import './Policies.css';

export default function FeedbackPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="policy-page" style={{ textAlign: 'center' }}>
                <h1 className="policy-title">Thank You!</h1>
                <p>We appreciate your feedback. It helps us improve our services.</p>
                <button onClick={() => setSubmitted(false)} className="submit-btn" style={{ maxWidth: '200px', margin: '2rem auto' }}>Submit Another</button>
            </div>
        );
    }

    return (
        <div className="policy-page">
            <h1 className="policy-title">Share Your Feedback</h1>
            <div className="form-container">
                <p style={{ marginBottom: '2rem', textAlign: 'center' }}>We'd love to hear from you! Let us know what you think about our products and services.</p>

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
                        <label className="form-label">Your Feedback</label>
                        <textarea className="form-textarea" required placeholder="Tell us about your experience..."></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Submit Feedback</button>
                </form>
            </div>
        </div>
    );
}
