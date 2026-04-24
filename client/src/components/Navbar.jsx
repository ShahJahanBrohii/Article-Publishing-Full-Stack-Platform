import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { useSiteSettings } from '../lib/siteSettings';
import '../styles/Navbar.css';

const INVESTING_MENU = {
  cols: 1,
  columns: [
    {
      label: 'Investing',
      items: [
        'Investing Basics',
        'Stocks & Bonds',
        'ETFs',
        'Mutual Funds',
        'Real Estate',
        'Portfolio Management',
        'Investing Strategies',
      ],
    },
  ],
};

const PERSONAL_FINANCE_MENU = {
  cols: 1,
  columns: [
    {
      label: 'Personal Finance',
      items: [
        'Budgeting and Saving',
        'Debt and Credit',
        'Emergency Funds',
        'Retirement',
        'Taxes',
        'Insurance',
      ],
    },
  ],
};

const FINANCIAL_EDUCATION_MENU = {
  cols: 1,
  columns: [
    {
      label: 'Financial Education',
      items: [
        'Foundations',
        'Financial Education',
        'Corporate Finance',
        'Investment Principles',
        'Financial Markets',
        'Financial Institutions',
        'Economic Foundations',
      ],
    },
  ],
};

const GUIDES_MENU = {
  cols: 1,
  columns: [
    {
      label: 'Guides',
      items: [
        'Getting Started',
        'Wealth Building',
        'Financial Planning',
        'Portfolio Building',
        'Risk Management',
        'Investment Decision-Making',
      ],
    },
  ],
};

// All nav sections in one place — used for both desktop and mobile drawer
const NAV_SECTIONS = [
  { key: 'investing',           label: 'Investing',           path: '/investing',           menu: INVESTING_MENU },
  { key: 'personal-finance',    label: 'Personal Finance',    path: '/personal-finance',    menu: PERSONAL_FINANCE_MENU },
  { key: 'financial-education', label: 'Financial Education', path: '/financial-education', menu: FINANCIAL_EDUCATION_MENU },
  { key: 'guides',              label: 'Guides',              path: '/guides',              menu: GUIDES_MENU },
];

function Navbar() {
  const { settings } = useSiteSettings();

  const openMenuTimerRef = useRef(null);
  const closeMenuTimerRef = useRef(null);

  // ── Desktop hover mega-menu ──────────────────────────────────────────────
  const [activeMenu,   setActiveMenu]   = useState(null);

  // ── Mobile drawer ────────────────────────────────────────────────────────
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [expandedItem, setExpandedItem] = useState(null); // which section is expanded in drawer

  // ── Search ───────────────────────────────────────────────────────────────
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');

  const searchInputRef = useRef(null);
  const navigate       = useNavigate();
  const location       = useLocation();

  // Close everything when route changes
  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
    setExpandedItem(null);
    setActiveMenu(null);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close drawer / search on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const clearHoverTimers = useCallback(() => {
    if (openMenuTimerRef.current) {
      clearTimeout(openMenuTimerRef.current);
      openMenuTimerRef.current = null;
    }
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback((menu) => {
    if (closeMenuTimerRef.current) {
      clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }

    openMenuTimerRef.current = setTimeout(() => {
      setActiveMenu(menu);
      openMenuTimerRef.current = null;
    }, 110);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (openMenuTimerRef.current) {
      clearTimeout(openMenuTimerRef.current);
      openMenuTimerRef.current = null;
    }

    closeMenuTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      closeMenuTimerRef.current = null;
    }, 160);
  }, []);

  useEffect(() => {
    return () => clearHoverTimers();
  }, [clearHoverTimers]);

  const toggleDrawer = () => {
    setDrawerOpen((o) => !o);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((o) => !o);
    setDrawerOpen(false);
    setSearchQuery('');
  };

  const toggleExpanded = (key) =>
    setExpandedItem((prev) => (prev === key ? null : key));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // Navigates to /search?q=... — wire this route in App.jsx as needed
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className={drawerOpen ? 'drawer-active' : ''}>
        <div className="header-inner">

          <div className="header-top-row">
            <div className="header-left-actions">
              {/* Hamburger — mobile only */}
              <button
                className="hamburger"
                onClick={toggleDrawer}
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
              >
                <span className={`hamburger__bar ${drawerOpen ? 'hamburger__bar--open' : ''}`} />
                <span className={`hamburger__bar ${drawerOpen ? 'hamburger__bar--open' : ''}`} />
                <span className={`hamburger__bar ${drawerOpen ? 'hamburger__bar--open' : ''}`} />
              </button>

              <Link to="/subscribe" className="subscribe-btn subscribe-btn--top">
                <svg className="subscribe-btn__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="1.5" y="2.25" width="15" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2.5 4.25L9 9.25L15.5 4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="subscribe-btn__label">Subscribe</span>
              </Link>
            </div>

            <Link to="/" className="site-title-link">
              <div className="site-brand">
                {settings?.siteLogo && (
                  <img
                    src={settings.siteLogo}
                    alt={settings.siteTitle || 'Site logo'}
                    className="site-brand__logo"
                  />
                )}
                <div className="site-title">{settings?.siteTitle || 'The Wall Street Investor'}</div>
              </div>
            </Link>

            {/* Search + Subscribe — right side */}
            <div className="header-actions">
              <button
                className="search-toggle"
                onClick={toggleSearch}
                aria-label={searchOpen ? 'Close search' : 'Open search'}
                aria-expanded={searchOpen}
              >
                <span className="search-toggle__label">{searchOpen ? 'Close' : 'Explore'}</span>
                {searchOpen ? (
                  // × close icon
                  <svg className="search-toggle__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // magnifier icon
                  <svg className="search-toggle__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.8"/>
                    <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <Link to="/admin/login" className="subscribe-btn admin-btn-nav">Admin</Link>
            </div>
          </div>

          

          {/* ── Desktop nav ────────────────────────────────────────────── */}
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link to="/about" className="nav-link">About</Link>

            {NAV_SECTIONS.map(({ key, label, path, menu }) => (
              <div
                key={key}
                className="nav-item"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={path} className="nav-link">{label}</Link>
                {activeMenu === key && (
                  <MegaMenu
                    id={`mega-${key}`}
                    basePath={path}
                    {...menu}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* ── Search bar (slides in below nav) ───────────────────────── */}
          {searchOpen && (
            <div className="search-bar" role="search">
              <form onSubmit={handleSearchSubmit} className="search-bar__form">
                <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.8"/>
                  <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  className="search-bar__input"
                  placeholder="Search articles…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="search-bar__btn" disabled={!searchQuery.trim()}>
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        id="mobile-drawer"
        className={`mobile-drawer ${drawerOpen ? 'mobile-drawer--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer__inner">

          {/* Search inside drawer */}
          <form onSubmit={handleSearchSubmit} className="mobile-search" role="search">
            <svg className="search-bar__icon" width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.8"/>
              <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              className="mobile-search__input"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </form>

          <div className="mobile-drawer__divider" />

          {/* About */}
          <Link to="/about" className="mobile-nav-link">About</Link>

          {/* Sections with expandable sub-items */}
          {NAV_SECTIONS.map(({ key, label, path, menu }) => {
            const isExpanded = expandedItem === key;
            const items = menu.columns[0]?.items ?? [];
            return (
              <div key={key} className="mobile-nav-section">
                <div className="mobile-nav-section__head">
                  <Link to={path} className="mobile-nav-link">
                    {label}
                  </Link>
                  <button
                    className={`mobile-expand-btn ${isExpanded ? 'mobile-expand-btn--open' : ''}`}
                    onClick={() => toggleExpanded(key)}
                    aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
                    aria-expanded={isExpanded}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {isExpanded && (
                  <div className="mobile-sub-links">
                    {items.map((item) => {
                      const slug = item.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      return (
                        <Link
                          key={item}
                          to={`${path}/${slug}`}
                          className="mobile-sub-link"
                        >
                          {item}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="mobile-drawer__divider" />

          <Link to="/subscribe" className="subscribe-btn mobile-subscribe-btn">
            Subscribe
          </Link>
          <Link to="/admin/login" className="subscribe-btn mobile-subscribe-btn admin-btn-nav">
            Admin
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;