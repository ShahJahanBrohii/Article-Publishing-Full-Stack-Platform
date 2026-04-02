import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeEmail } from '../lib/api';
import '../styles/Subscribe.css';

function Subscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    const result = await subscribeEmail(email, 'subscribe-page');
    setPending(false);
    if (result.ok) {
      setStatus({
        type: 'ok',
        message: result.local
          ? "You're on the list. (Saved locally until the server is connected.)"
          : "You're subscribed. Check your inbox for a confirmation.",
      });
      setEmail('');
    } else {
      setStatus({ type: 'err', message: result.error || 'Something went wrong.' });
    }
  };

  return (
    <div className="subscribe-page">
      <section className="subscribe-hero">
        <h1>Subscribe</h1>
        <p>Morning Briefing and weekly digests — the same editorial voice, in your inbox.</p>
      </section>

      <section className="subscribe-content">
        <div className="subscribe-container">
          <p className="subscribe-copy">
            Free newsletters. No spam. Unsubscribe anytime. By subscribing you agree to receive email
            updates from <em>Come Read with Junaid</em> / <em>The Wall Street Investor</em>.
          </p>

          {status?.type === 'ok' && (
            <div className="subscribe-banner subscribe-banner--ok" role="status">
              {status.message}
            </div>
          )}
          {status?.type === 'err' && (
            <div className="subscribe-banner subscribe-banner--err" role="alert">
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="subscribe-form">
            <label htmlFor="sub-email" className="subscribe-label">
              Email address
            </label>
            <div className="subscribe-row">
              <input
                id="sub-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="subscribe-input"
                required
                autoComplete="email"
              />
              <button type="submit" className="subscribe-submit" disabled={pending}>
                {pending ? '…' : 'Subscribe'}
              </button>
            </div>
          </form>

          <p className="subscribe-foot">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Subscribe;
