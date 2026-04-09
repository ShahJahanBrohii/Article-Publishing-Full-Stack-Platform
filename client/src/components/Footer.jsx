import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../lib/siteSettings';
import '../styles/Footer.css';


const COMPANY_LINKS = [
  { label: 'About',   to: '/about'   },
  { label: 'Contact', to: '/contact' },
  { label: 'Subscribe', to: '/subscribe' },
];

// Simple SVG social icons — no external icon library needed
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function RSSIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
    </svg>
  );
}

function Footer() {
  const { settings, loading } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  if (loading || !settings) return null; // Don't render footer until settings are loaded

  // Create legal links from settings
  const LEGAL_LINKS = [
    { label: settings.privacyPolicySummary, to: '/privacy' },
    { label: settings.termsOfServiceSummary, to: '/terms' },
    { label: settings.cookiePolicySummary, to: '/cookies' },
    { label: settings.disclaimerSummary, to: '/disclaimer' },
  ];

  return (
    <footer className="site-footer">

      {/* ── Newsletter CTA band ──────────────────────────────────────── */}
      <div className="footer-newsletter-band">
        <div className="footer-newsletter-band__inner">
          <div className="footer-newsletter-band__copy">
            <p className="footer-newsletter-band__heading">{settings.newsletterTitle}</p>
            <p className="footer-newsletter-band__sub">
              {settings.newsletterSubtitle}
            </p>
          </div>
          <Link to="/subscribe" className="footer-newsletter-band__cta">
            Subscribe Free →
          </Link>
        </div>
      </div>

      {/* ── Main footer body ─────────────────────────────────────────── */}
      <div className="footer-body">
        <div className="footer-body__inner">

          {/* Brand column */}
          <div className="footer-brand">
            <Link to="/" className="footer-brand__title">
              {settings.siteTitle}
            </Link>
            <p className="footer-brand__tagline">
              {settings.footerBrandText}
            </p>
            <div className="footer-social">
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social__link"
                  aria-label="Follow us on X (Twitter)"
                >
                  <TwitterIcon />
                </a>
              )}
              {settings.socialLinks?.linkedin && (
                <a
                  href={settings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social__link"
                  aria-label="Follow us on LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              )}
              {settings.socialLinks?.rss && (
                <a
                  href={settings.socialLinks.rss}
                  className="footer-social__link"
                  aria-label="RSS feed"
                >
                  <RSSIcon />
                </a>
              )}
            </div>
          </div>

        

          {/* Company column */}
          <nav className="footer-nav-col" aria-label="Company links">
            <span className="footer-nav-col__heading">Company</span>
            <ul className="footer-nav-col__list">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-nav-col__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner">
          <p className="footer-bottom__copy">
            &copy; {currentYear} &nbsp;◆&nbsp; Come Read with Junaid &nbsp;◆&nbsp; {settings.copyrightText}
          </p>
          <nav className="footer-legal" aria-label="Legal links">
            {LEGAL_LINKS.map((link, i) => (
              <React.Fragment key={link.to}>
                <Link to={link.to} className="footer-legal__link">
                  {link.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span className="footer-legal__sep" aria-hidden="true">·</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

    </footer>
  );
}


export default Footer;