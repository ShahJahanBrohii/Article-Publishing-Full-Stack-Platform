const mongoose = require('mongoose');

// Single-document collection for global site settings
const siteSettingsSchema = new mongoose.Schema(
  {
    settingsKey:      { type: String, default: 'global' },

    // ── Site Branding ──
    siteTitle:        { type: String, default: 'The Wall Street Investor' },
    siteTagline:      { type: String, default: 'Quality over quantity. Depth over virality.' },
    siteLogo:         { type: String, default: '' }, // URL to logo image
    siteFavicon:      { type: String, default: '' }, // URL to favicon
    siteDescription:  { type: String, default: 'A professional-grade financial journalism platform.' },

    // ── Footer ──
    footerBrandText:  { type: String, default: 'Quality over quantity. Depth over virality. Every article is chosen because it has something meaningful to offer.' },
    copyrightText:    { type: String, default: 'All rights reserved.' },

    // ── About ──
    aboutHeroTitle:    { type: String, default: 'About Come Read with Junaid' },
    aboutHeroSubtitle: { type: String, default: 'A curated space for thoughtful reading and deep conversations' },
    aboutMissionTitle: { type: String, default: 'Our Mission' },
    aboutMissionBody:  { type: String, default: 'We believe in the transformative power of reading. In an age of endless content, we curate thoughtfully selected articles on history, philosophy, culture, and the beauty of the written word.' },
    aboutCoverTitle:   { type: String, default: 'What We Cover' },
    aboutCoverItems:   { type: String, default: 'History & Cultural Traditions\nPhilosophy & Ideas\nLiterature & Poetry\nScience & Discovery\nPersonal Essays & Reflections' },
    aboutValuesTitle:  { type: String, default: 'Our Values' },
    aboutValuesBody:   { type: String, default: 'Quality over quantity. Depth over virality. Every article is chosen because it has something meaningful to offer — something that moves the mind and enriches the soul.' },
    aboutContent:      { type: String, default: '' },
    
    // ── Newsletter ──
    newsletterTitle:  { type: String, default: 'Morning Briefing' },
    newsletterSubtitle: { type: String, default: 'Five financial insights in your inbox every morning. No noise, no spam.' },

    // ── Contact & Company ──
    contactEmail:     { type: String, default: 'contact@example.com' },
    companyAddress:   { type: String, default: '' },
    companyPhone:     { type: String, default: '' },

    // ── Social Media Links ──
    socialLinks: {
      twitter:  { type: String, default: 'https://twitter.com' },
      linkedin: { type: String, default: 'https://linkedin.com' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      rss:      { type: String, default: '/rss.xml' },
    },

    // ── Legal Pages ──
    privacyPolicySummary: { type: String, default: 'Privacy Policy' },
    privacyPolicyUrl:     { type: String, default: '/privacy' },
    privacyPolicyContent: { type: String, default: '<section><h2>1. Introduction</h2><p>At Come Read with Junaid, we respect your privacy and are committed to protecting your personal data.</p></section>\n<section><h2>2. Information We Collect</h2><p>We may collect information about you in a variety of ways, including:</p><ul><li><strong>Personal Information:</strong> Name, email address, and other details you voluntarily provide</li><li><strong>Newsletter Subscriptions:</strong> Email addresses from users who subscribe</li><li><strong>Usage Data:</strong> Pages visited, time spent, and browsing patterns</li></ul></section>\n<section><h2>3. How We Use Your Information</h2><p>We use the information we collect to send you our newsletter, understand user behavior, respond to inquiries, and comply with legal obligations.</p></section>' },
    
    termsOfServiceSummary: { type: String, default: 'Terms of Service' },
    termsOfServiceUrl:     { type: String, default: '/terms' },
    termsOfServiceContent: { type: String, default: '<section><h2>1. Acceptance of Terms</h2><p>By accessing and using Come Read with Junaid, you accept and agree to be bound by the terms of this agreement.</p></section>\n<section><h2>2. Use License</h2><p>Permission is granted to temporarily download materials for personal viewing only. Under this license you may not modify, copy, or use materials for any commercial purpose.</p></section>\n<section><h2>3. Disclaimer</h2><p>The materials are provided on an \'as is\' basis. We make no warranties, expressed or implied.</p></section>' },

    cookiePolicySummary:  { type: String, default: 'Cookie Policy' },
    cookiePolicyUrl:      { type: String, default: '/cookies' },
    cookiePolicyContent:  { type: String, default: '<section><h2>1. What Are Cookies?</h2><p>Cookies are small files stored on your browser. They help websites remember information about your visit.</p></section>\n<section><h2>2. How We Use Cookies</h2><p>We use cookies for: Essential functionality, Analytics, Preferences, and Marketing purposes.</p></section>\n<section><h2>3. Managing Your Cookies</h2><p>Most browsers allow you to control cookies through their settings. Disabling cookies may affect website functionality.</p></section>' },

    disclaimerSummary:    { type: String, default: 'Disclaimer' },
    disclaimerUrl:        { type: String, default: '/disclaimer' },
    disclaimerContent:    { type: String, default: '<section><h2>1. General Information</h2><p>The information provided is for educational and informational purposes only. It is not intended to be professional, financial, or legal advice.</p></section>\n<section><h2>2. Investment Disclaimer</h2><p>Nothing on this website should be construed as investment advice. Before making any investment decision, please consult with a qualified financial advisor.</p></section>\n<section><h2>3. Accuracy</h2><p>While we strive to provide accurate information, we make no warranty regarding accuracy or completeness of any content.</p></section>' },

    // ── Google Analytics & Tracking ──
    googleAnalyticsId: { type: String, default: '' },

    // ── Maintenance Mode ──
    maintenanceMode:   { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently undergoing maintenance. Please check back soon.' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
