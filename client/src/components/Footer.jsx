import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../lib/siteSettings';
import { SECTIONS } from '../data/sections';
import '../styles/Footer.css';


const COMPANY_LINKS = [
  { label: 'About',     to: '/about'     },
  { label: 'Contact',   to: '/contact'   },
  { label: 'Subscribe', to: '/subscribe' },
];

const EXPLORE_COLUMNS = [
  {
    heading: 'Investing',
    sectionId: 'investing',
    items: SECTIONS.investing.topics,
  },
  {
    heading: 'Personal Finance',
    sectionId: 'personal-finance',
    items: SECTIONS['personal-finance'].topics,
  },
  {
    heading: 'Financial Education',
    sectionId: 'financial-education',
    items: SECTIONS['financial-education'].topics,
  },
  {
    heading: 'Guides',
    sectionId: 'guides',
    items: SECTIONS.guides.topics,
  },
  {
    heading: 'More',
    sectionId: 'investing',
    items: [
      ...SECTIONS.investing.topics,
    ],
  },
];

// ── Icons ────────────────────────────────────────────────────────────────────

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

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 10 0 0 0 22 12z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zm8.98 1.35a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8A3.2 3.2 0 1 0 12 15.2a3.2 3.2 0 0 0 0-6.4z"/>
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

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`footer-accordion__chevron${open ? ' footer-accordion__chevron--open' : ''}`}
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Mobile accordion item ─────────────────────────────────────────────────────
function AccordionColumn({ column }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="footer-accordion__item">
      <button
        className="footer-accordion__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{column.heading}</span>
        <ChevronIcon open={open} />
      </button>

      <div
        className="footer-accordion__panel"
        aria-hidden={!open}
        style={{ '--panel-height': open ? '1000px' : '0px' }}
      >
        <ul className="footer-accordion__list">
          {column.items.map((item) => (
            <li key={`${column.heading}-${item.slug}`}>
              <Link
                to={`/${column.sectionId}/${item.slug}`}
                className="footer-accordion__link"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Footer() {
  const { settings, loading } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  if (loading || !settings) return null;

  const LEGAL_LINKS = [
    { label: settings.privacyPolicySummary,  to: '/privacy'    },
    { label: settings.termsOfServiceSummary, to: '/terms'      },
    { label: settings.cookiePolicySummary,   to: '/cookies'    },
    { label: settings.disclaimerSummary,     to: '/disclaimer' },
  ].filter((l) => l.label);

  return (
    <footer className="site-footer">

      {/* ── Newsletter CTA band ──────────────────────────────────────── */}
      <div className="footer-newsletter-band">
        <div className="footer-newsletter-band__inner">
          <div className="footer-newsletter-band__copy">
            <p className="footer-newsletter-band__heading">{settings.newsletterTitle}</p>
            <p className="footer-newsletter-band__sub">{settings.newsletterSubtitle}</p>
          </div>
          <Link to="/subscribe" className="footer-newsletter-band__cta">
            <span>Subscribe</span>
            <MailIcon />
          </Link>
        </div>
      </div>

      {/* ── Main footer body ─────────────────────────────────────────── */}
      <div className="footer-body">
        <div className="footer-body__inner">

          {/* Company + social — unchanged */}
          <section className="footer-company" aria-label="Company links and social profiles">
            <h2 className="footer-section-heading">Company</h2>
            <ul className="footer-company__links">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-company__link">{link.label}</Link>
                </li>
              ))}
            </ul>

            <div className="footer-social">
              {settings.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                   className="footer-social__link" aria-label="Follow us on X (Twitter)">
                  <TwitterIcon />
                </a>
              )}
              {settings.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                   className="footer-social__link" aria-label="Follow us on LinkedIn">
                  <LinkedInIcon />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                   className="footer-social__link" aria-label="Follow us on Facebook">
                  <FacebookIcon />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                   className="footer-social__link" aria-label="Follow us on Instagram">
                  <InstagramIcon />
                </a>
              )}
              {settings.socialLinks?.rss && (
                <a href={settings.socialLinks.rss}
                   className="footer-social__link" aria-label="RSS feed">
                  <RSSIcon />
                </a>
              )}
            </div>
          </section>

          {/* Explore section */}
          <section className="footer-explore" aria-label="Explore topics">
            <h2 className="footer-section-heading">Explore</h2>

            {/* ── DESKTOP: static 5-column grid (hidden on mobile via CSS) ── */}
            <div className="footer-explore__grid">
              {EXPLORE_COLUMNS.map((column) => (
                <div key={column.heading} className="footer-explore__column">
                  <h3 className="footer-explore__heading">{column.heading}</h3>
                  <ul className="footer-explore__list">
                    {column.items.map((item) => (
                      <li key={`${column.heading}-${item.slug}`}>
                        <Link
                          to={`/${column.sectionId}/${item.slug}`}
                          className="footer-explore__link"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── MOBILE: accordion (hidden on desktop via CSS) ── */}
            <div className="footer-accordion">
              {EXPLORE_COLUMNS.map((column) => (
                <AccordionColumn key={column.heading} column={column} />
              ))}
            </div>

          </section>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner">
          <nav className="footer-legal" aria-label="Legal links">
            {LEGAL_LINKS.map((link, i) => (
              <React.Fragment key={link.to}>
                <Link to={link.to} className="footer-legal__link">{link.label}</Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span className="footer-legal__sep" aria-hidden="true">·</span>
                )}
              </React.Fragment>
            ))}
          </nav>
          <p className="footer-bottom__copy">
            {currentYear}. {settings.copyrightText}
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;