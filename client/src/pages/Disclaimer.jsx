import React from 'react';
import { useSiteSettings } from '../lib/siteSettings';
import '../styles/LegalPages.css';

export default function Disclaimer() {
  const { settings, loading } = useSiteSettings();

  if (loading) return <div className="legal-page"><div className="legal-page__container" style={{ textAlign: 'center', padding: '60px 20px' }}>Loading...</div></div>;

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">Disclaimer</h1>
        
        <div className="legal-page__content">
          {settings?.disclaimerContent && settings.disclaimerContent.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: settings.disclaimerContent }} />
          ) : (
            <p>Content not available. Please check back later.</p>
          )}
        </div>
      </div>
    </div>
  );
}
