import React, { useState } from 'react';
import './Policies.css';
import { supabase } from '../supabaseClient';

export default function ComplaintsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        orderId: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false); // Added missing state for 'submitted'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { error } = await supabase.from('complaints').insert([{
            name: formData.name,
            email: formData.email,
            order_id: formData.orderId || null,
            message: formData.message,
            status: 'Open'
        }]);

        if (error) {
            alert("Error submitting complaint: " + error.message);
        } else {
            setSubmitted(true);
        }
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
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Order ID (if applicable)</label>
                        <input
                            type="text"
                            name="orderId"
                            className="form-input"
                            value={formData.orderId}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Complaint Details</label>
                        <textarea
                            name="message"
                            className="form-textarea"
                            required
                            placeholder="Describe your issue..."
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Submit Complaint</button>
                </form>
            </div>
        </div>
    );
}
