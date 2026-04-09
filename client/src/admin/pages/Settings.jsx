import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../adminApi';
import { notifySiteSettingsUpdated } from '../../lib/siteSettings';
import '../styles/Admin.css';

const ABOUT_DEFAULTS = {
  aboutHeroTitle: 'About Come Read with Junaid',
  aboutHeroSubtitle: 'A curated space for thoughtful reading and deep conversations',
  aboutMissionTitle: 'Our Mission',
  aboutMissionBody: 'We believe in the transformative power of reading. In an age of endless content, we curate thoughtfully selected articles on history, philosophy, culture, and the beauty of the written word.',
  aboutCoverTitle: 'What We Cover',
  aboutCoverItems: 'History & Cultural Traditions\nPhilosophy & Ideas\nLiterature & Poetry\nScience & Discovery\nPersonal Essays & Reflections',
  aboutValuesTitle: 'Our Values',
  aboutValuesBody: 'Quality over quantity. Depth over virality. Every article is chosen because it has something meaningful to offer — something that moves the mind and enriches the soul.',
};

function normalizeSettings(data) {
  return {
    ...data,
    aboutHeroTitle: data.aboutHeroTitle || ABOUT_DEFAULTS.aboutHeroTitle,
    aboutHeroSubtitle: data.aboutHeroSubtitle || ABOUT_DEFAULTS.aboutHeroSubtitle,
    aboutMissionTitle: data.aboutMissionTitle || ABOUT_DEFAULTS.aboutMissionTitle,
    aboutMissionBody: data.aboutMissionBody || ABOUT_DEFAULTS.aboutMissionBody,
    aboutCoverTitle: data.aboutCoverTitle || ABOUT_DEFAULTS.aboutCoverTitle,
    aboutCoverItems: data.aboutCoverItems || ABOUT_DEFAULTS.aboutCoverItems,
    aboutValuesTitle: data.aboutValuesTitle || ABOUT_DEFAULTS.aboutValuesTitle,
    aboutValuesBody: data.aboutValuesBody || ABOUT_DEFAULTS.aboutValuesBody,
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAboutHtml(form) {
  const coverItems = String(form.aboutCoverItems || '')
    .split(/\r?\n|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `
    <section class="about-section">
      <h2>${escapeHtml(form.aboutMissionTitle || ABOUT_DEFAULTS.aboutMissionTitle)}</h2>
      <p>${escapeHtml(form.aboutMissionBody || ABOUT_DEFAULTS.aboutMissionBody)}</p>
    </section>
    <section class="about-section">
      <h2>${escapeHtml(form.aboutCoverTitle || ABOUT_DEFAULTS.aboutCoverTitle)}</h2>
      <ul>${coverItems}</ul>
    </section>
    <section class="about-section">
      <h2>${escapeHtml(form.aboutValuesTitle || ABOUT_DEFAULTS.aboutValuesTitle)}</h2>
      <p>${escapeHtml(form.aboutValuesBody || ABOUT_DEFAULTS.aboutValuesBody)}</p>
    </section>
  `.trim();
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('site');
  const [retrying, setRetrying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [previousTab, setPreviousTab] = useState('site');

  // Load settings on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        setSettings(normalizeSettings(data));
        setLoaded(true);
      } catch (err) {
        const errorMsg = err?.message || 'Failed to load settings. Make sure the server is running.';
        setMessage({ type: 'error', text: errorMsg });
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Retry loading settings
  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    setMessage(null);
    async function load() {
      try {
        const data = await getSettings();
        setSettings(normalizeSettings(data));
        setLoaded(true);
      } catch (err) {
        const errorMsg = err?.message || 'Failed to load settings. Make sure the server is running.';
        setMessage({ type: 'error', text: errorMsg });
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    }
    load();
  };

  useEffect(() => {
    if (previousTab === activeTab) return;

    const leavingAbout = previousTab === 'about' && activeTab !== 'about';
    if (leavingAbout && loaded && settings) {
      persistSettings({ notify: false });
    }

    setPreviousTab(activeTab);
  }, [activeTab, loaded, settings, previousTab]);

  // Update a field in settings
  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Update nested object fields (e.g., socialLinks.twitter)
  const updateNestedField = (parent, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  // Save settings to server
  const persistSettings = async ({ notify = true } = {}) => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        aboutContent: buildAboutHtml(settings),
      };
      await updateSettings(payload);
      notifySiteSettingsUpdated();
      if (notify) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setMessage(null);
    await persistSettings({ notify: true });
  };

  useEffect(() => {
    if (!loaded || loading || activeTab !== 'about' || !settings) return;

    const timer = setTimeout(() => {
      persistSettings({ notify: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, loaded, loading, settings]);

  if (loading) return <div className="admin-page-loading">Loading settings…</div>;
  if (!settings) return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">Site Settings</h1>
      </div>
      <div className="admin-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="admin-alert admin-alert--error" style={{ marginBottom: '20px' }}>
          {message?.text || 'Failed to load settings'}
        </div>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Make sure the server is running and has been restarted after installing settings feature.
        </p>
        <button
          className="admin-btn admin-btn--primary"
          onClick={handleRetry}
          disabled={retrying}
        >
          {retrying ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">Site Settings</h1>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`admin-alert admin-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'site' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('site')}
        >
          Site Branding
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'footer' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          Footer
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'newsletter' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('newsletter')}
        >
          Newsletter
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'about' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Page
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'contact' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact & Company
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'social' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'legal' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('legal')}
        >
          Legal Pages
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'tracking' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          Tracking & Other
        </button>
      </div>

      {/* Site Branding Tab */}
      {activeTab === 'site' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Site Branding</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Site Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.siteTitle}
              onChange={(e) => updateField('siteTitle', e.target.value)}
              placeholder="The Wall Street Investor"
            />
            <small className="admin-field__hint">Used in browser tab and header</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Site Tagline/Description</label>
            <textarea
              className="admin-input"
              rows="3"
              value={settings.siteTagline}
              onChange={(e) => updateField('siteTagline', e.target.value)}
              placeholder="Quality over quantity. Depth over virality."
            />
            <small className="admin-field__hint">Displayed on homepage and in footer</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Site Logo URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.siteLogo}
              onChange={(e) => updateField('siteLogo', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <small className="admin-field__hint">URL to your site logo image</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Site Favicon URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.siteFavicon}
              onChange={(e) => updateField('siteFavicon', e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
            <small className="admin-field__hint">Favicon displayed in browser tab</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Site Description (Meta)</label>
            <textarea
              className="admin-input"
              rows="2"
              value={settings.siteDescription}
              onChange={(e) => updateField('siteDescription', e.target.value)}
              placeholder="A professional-grade financial journalism platform."
            />
            <small className="admin-field__hint">Used in search engines and social metatags</small>
          </div>
        </div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Footer Content</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Footer Brand Text</label>
            <textarea
              className="admin-input"
              rows="4"
              value={settings.footerBrandText}
              onChange={(e) => updateField('footerBrandText', e.target.value)}
              placeholder="Quality over quantity..."
            />
            <small className="admin-field__hint">Displayed in footer brand column</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Copyright Text</label>
            <input
              type="text"
              className="admin-input"
              value={settings.copyrightText}
              onChange={(e) => updateField('copyrightText', e.target.value)}
              placeholder="© 2024 All rights reserved."
            />
            <small className="admin-field__hint">Shown at bottom of footer with current year</small>
          </div>
        </div>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Newsletter Settings</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Newsletter Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.newsletterTitle}
              onChange={(e) => updateField('newsletterTitle', e.target.value)}
              placeholder="Morning Briefing"
            />
            <small className="admin-field__hint">Headline for newsletter CTA band</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Newsletter Subtitle</label>
            <textarea
              className="admin-input"
              rows="3"
              value={settings.newsletterSubtitle}
              onChange={(e) => updateField('newsletterSubtitle', e.target.value)}
              placeholder="Five financial insights in your inbox every morning..."
            />
            <small className="admin-field__hint">Description of newsletter benefits</small>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">About Page</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Hero Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.aboutHeroTitle || ''}
              onChange={(e) => updateField('aboutHeroTitle', e.target.value)}
              placeholder="About Come Read with Junaid"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Hero Subtitle</label>
            <textarea
              className="admin-input"
              rows="3"
              value={settings.aboutHeroSubtitle || ''}
              onChange={(e) => updateField('aboutHeroSubtitle', e.target.value)}
              placeholder="A curated space for thoughtful reading and deep conversations"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Mission Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.aboutMissionTitle || ''}
              onChange={(e) => updateField('aboutMissionTitle', e.target.value)}
              placeholder="Our Mission"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Mission Body</label>
            <textarea
              className="admin-input"
              rows="5"
              value={settings.aboutMissionBody || ''}
              onChange={(e) => updateField('aboutMissionBody', e.target.value)}
              placeholder="We believe in the transformative power of reading..."
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">What We Cover Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.aboutCoverTitle || ''}
              onChange={(e) => updateField('aboutCoverTitle', e.target.value)}
              placeholder="What We Cover"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">What We Cover Items</label>
            <textarea
              className="admin-input"
              rows="6"
              value={settings.aboutCoverItems || ''}
              onChange={(e) => updateField('aboutCoverItems', e.target.value)}
              placeholder={ABOUT_DEFAULTS.aboutCoverItems}
            />
            <small className="admin-field__hint">One item per line, or comma-separated.</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Values Title</label>
            <input
              type="text"
              className="admin-input"
              value={settings.aboutValuesTitle || ''}
              onChange={(e) => updateField('aboutValuesTitle', e.target.value)}
              placeholder="Our Values"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Values Body</label>
            <textarea
              className="admin-input"
              rows="5"
              value={settings.aboutValuesBody || ''}
              onChange={(e) => updateField('aboutValuesBody', e.target.value)}
              placeholder="Quality over quantity..."
            />
          </div>
        </div>
      )}

      {/* Contact & Company Tab */}
      {activeTab === 'contact' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Contact & Company Information</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Contact Email</label>
            <input
              type="email"
              className="admin-input"
              value={settings.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="contact@example.com"
            />
            <small className="admin-field__hint">Primary contact email address</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Company Address</label>
            <textarea
              className="admin-input"
              rows="3"
              value={settings.companyAddress}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="123 Business St, City, State 12345"
            />
            <small className="admin-field__hint">Physical address for legal/footer use</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Company Phone</label>
            <input
              type="tel"
              className="admin-input"
              value={settings.companyPhone}
              onChange={(e) => updateField('companyPhone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            <small className="admin-field__hint">Contact phone number</small>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Social Media Links</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Twitter/X URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.socialLinks?.twitter || ''}
              onChange={(e) => updateNestedField('socialLinks', 'twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">LinkedIn URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) => updateNestedField('socialLinks', 'linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Facebook URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.socialLinks?.facebook || ''}
              onChange={(e) => updateNestedField('socialLinks', 'facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Instagram URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.socialLinks?.instagram || ''}
              onChange={(e) => updateNestedField('socialLinks', 'instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">RSS Feed URL</label>
            <input
              type="text"
              className="admin-input"
              value={settings.socialLinks?.rss || ''}
              onChange={(e) => updateNestedField('socialLinks', 'rss', e.target.value)}
              placeholder="/rss.xml"
            />
          </div>
        </div>
      )}

      {/* Legal Pages Tab */}
      {activeTab === 'legal' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Legal Pages</h2>
            <small style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'block', color: '#666' }}>
              Configure links, labels, and content for your legal pages
            </small>
          </div>

          {/* Privacy Policy */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>Privacy Policy</h3>
            
            <div className="admin-field">
              <label className="admin-label">Label</label>
              <input
                type="text"
                className="admin-input"
                value={settings.privacyPolicySummary}
                onChange={(e) => updateField('privacyPolicySummary', e.target.value)}
                placeholder="Privacy Policy"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.privacyPolicyUrl}
                onChange={(e) => updateField('privacyPolicyUrl', e.target.value)}
                placeholder="/privacy"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Content</label>
              <textarea
                className="admin-input"
                rows="10"
                value={settings.privacyPolicyContent}
                onChange={(e) => updateField('privacyPolicyContent', e.target.value)}
                placeholder="Enter privacy policy content here..."
              />
              <small className="admin-field__hint">HTML tags supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</small>
            </div>
          </div>

          {/* Terms of Service */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>Terms of Service</h3>
            
            <div className="admin-field">
              <label className="admin-label">Label</label>
              <input
                type="text"
                className="admin-input"
                value={settings.termsOfServiceSummary}
                onChange={(e) => updateField('termsOfServiceSummary', e.target.value)}
                placeholder="Terms of Service"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.termsOfServiceUrl}
                onChange={(e) => updateField('termsOfServiceUrl', e.target.value)}
                placeholder="/terms"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Content</label>
              <textarea
                className="admin-input"
                rows="10"
                value={settings.termsOfServiceContent}
                onChange={(e) => updateField('termsOfServiceContent', e.target.value)}
                placeholder="Enter terms of service content here..."
              />
              <small className="admin-field__hint">HTML tags supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</small>
            </div>
          </div>

          {/* Cookie Policy */}
          <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>Cookie Policy</h3>
            
            <div className="admin-field">
              <label className="admin-label">Label</label>
              <input
                type="text"
                className="admin-input"
                value={settings.cookiePolicySummary}
                onChange={(e) => updateField('cookiePolicySummary', e.target.value)}
                placeholder="Cookie Policy"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.cookiePolicyUrl}
                onChange={(e) => updateField('cookiePolicyUrl', e.target.value)}
                placeholder="/cookies"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Content</label>
              <textarea
                className="admin-input"
                rows="10"
                value={settings.cookiePolicyContent}
                onChange={(e) => updateField('cookiePolicyContent', e.target.value)}
                placeholder="Enter cookie policy content here..."
              />
              <small className="admin-field__hint">HTML tags supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</small>
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' }}>Disclaimer</h3>
            
            <div className="admin-field">
              <label className="admin-label">Label</label>
              <input
                type="text"
                className="admin-input"
                value={settings.disclaimerSummary}
                onChange={(e) => updateField('disclaimerSummary', e.target.value)}
                placeholder="Disclaimer"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.disclaimerUrl}
                onChange={(e) => updateField('disclaimerUrl', e.target.value)}
                placeholder="/disclaimer"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Content</label>
              <textarea
                className="admin-input"
                rows="10"
                value={settings.disclaimerContent}
                onChange={(e) => updateField('disclaimerContent', e.target.value)}
                placeholder="Enter disclaimer content here..."
              />
              <small className="admin-field__hint">HTML tags supported: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;</small>
            </div>
          </div>
        </div>
      )}

      {/* Tracking & Other Tab */}
      {activeTab === 'tracking' && (
        <div className="admin-card">
          <div className="admin-card__head">
            <h2 className="admin-card__title">Tracking & Other Settings</h2>
          </div>

          <div className="admin-field">
            <label className="admin-label">Google Analytics ID</label>
            <input
              type="text"
              className="admin-input"
              value={settings.googleAnalyticsId}
              onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <small className="admin-field__hint">Measurement ID for Google Analytics 4</small>
          </div>

          <div className="admin-field">
            <label className="admin-label">Maintenance Mode</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateField('maintenanceMode', e.target.checked)}
              />
              <span>Enable maintenance mode</span>
            </label>
            <small className="admin-field__hint">When enabled, visitors will see maintenance message</small>
          </div>

          {settings.maintenanceMode && (
            <div className="admin-field">
              <label className="admin-label">Maintenance Message</label>
              <textarea
                className="admin-input"
                rows="3"
                value={settings.maintenanceMessage}
                onChange={(e) => updateField('maintenanceMessage', e.target.value)}
                placeholder="We are currently undergoing maintenance..."
              />
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
