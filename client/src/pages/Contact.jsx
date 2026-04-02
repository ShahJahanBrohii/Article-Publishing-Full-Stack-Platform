import React, { useState } from 'react';
import '../styles/Contact.css';
import { submitContact } from '../lib/api';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await submitContact(formData);
    setPending(false);

    if (result.ok) {
      setSubmitted(true);
      setSavedLocally(!!result.local);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        setSavedLocally(false);
      }, 8000);
    } else {
      setError(result.error || 'Could not send your message. Please try again.');
    }
  };

  return (
    <div className="contact">
      <section className="contact-header">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you. Send us a message.</p>
      </section>

      <section className="contact-content">
        <div className="contact-container">
          {submitted && (
            <div className="success-message" role="status">
              {savedLocally
                ? "Thank you — your message was saved locally. We'll sync when the server is available, or you can try again later."
                : 'Thank you! Your message has been sent.'}
            </div>
          )}
          {error && (
            <div className="contact-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={pending}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={pending}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={pending}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                required
                disabled={pending}
              ></textarea>
            </div>

            <button type="submit" className="submit-button" disabled={pending}>
              {pending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
