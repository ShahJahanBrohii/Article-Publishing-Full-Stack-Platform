import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MegaMenu from './MegaMenu';
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
        'Investing Strategies'
      ]
    }
  ]
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
        'Insurance'
      ]
    }
  ]
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
        'Economic Foundations'
      ]
    }
  ]
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
        'Investment Decision-Making'
      ]
    }
  ]
};

function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMouseEnter = (menu) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  return (
    <header>
      <div className="header-inner">
        <div className="header-rule"></div>
        <Link to="/" className="site-title-link">
          <div className="site-title">The Wall Street Investor</div>
        </Link>
        <div className="header-rule-bottom"></div>

        <nav>
          <Link to="/about" className="nav-link">About</Link>

          <div 
            className="nav-item"
            onMouseEnter={() => handleMouseEnter('investing')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/investing" className="nav-link">Investing</Link>
            {activeMenu === 'investing' && (
              <MegaMenu id="mega-investing" basePath="/investing" {...INVESTING_MENU} />
            )}
          </div>

          <div 
            className="nav-item"
            onMouseEnter={() => handleMouseEnter('personal-finance')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/personal-finance" className="nav-link">Personal Finance</Link>
            {activeMenu === 'personal-finance' && (
              <MegaMenu id="mega-personal-finance" basePath="/personal-finance" {...PERSONAL_FINANCE_MENU} />
            )}
          </div>

          <div 
            className="nav-item"
            onMouseEnter={() => handleMouseEnter('financial-education')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/financial-education" className="nav-link">Financial Education</Link>
            {activeMenu === 'financial-education' && (
              <MegaMenu id="mega-financial-education" basePath="/financial-education" {...FINANCIAL_EDUCATION_MENU} />
            )}
          </div>

          <div 
            className="nav-item"
            onMouseEnter={() => handleMouseEnter('guides')}
            onMouseLeave={handleMouseLeave}
          >
            <Link to="/guides" className="nav-link">Guides</Link>
            {activeMenu === 'guides' && (
              <MegaMenu id="mega-guides" basePath="/guides" {...GUIDES_MENU} />
            )}
          </div>

          <Link to="/subscribe" className="subscribe-btn">Subscribe</Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
