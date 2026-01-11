import React, { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <section className="contact-section">
        <div className="contact-container">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-intro">
            We'd love to hear from you! Whether you have a question, feedback,
            or just want to say hello — fill out the form below and we’ll get
            back to you soon.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <p className="newsletter-text">
          Subscribe to our newsletter and get early access to new collections,
          discounts & more.
        </p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>SUBSCRIBE</button>
        </div>
      </section>
    </>
  );
}
