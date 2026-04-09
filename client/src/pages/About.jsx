import React from 'react';
import { useSiteSettings } from '../lib/siteSettings';
import '../styles/About.css';

function About() {
  const { settings, loading } = useSiteSettings();

  const sanitizeAboutHtml = (raw = '') => {
    if (!raw || typeof window === 'undefined' || typeof DOMParser === 'undefined') return '';

    const doc = new DOMParser().parseFromString(raw, 'text/html');
    doc.querySelectorAll('script, style, iframe, object, embed, form').forEach((el) => el.remove());

    doc.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || '');

        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  const splitListItems = (value = '') => value
    .split(/\r?\n|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  const hasStructuredAbout = Boolean(
    settings?.aboutMissionTitle ||
    settings?.aboutMissionBody ||
    settings?.aboutCoverTitle ||
    settings?.aboutCoverItems ||
    settings?.aboutValuesTitle ||
    settings?.aboutValuesBody
  );

  if (loading) {
    return (
      <div className="about">
        <div className="about-hero" />
      </div>
    );
  }

  return (
    <div className="about">
      <section className="about-hero">
        <h1>{settings?.aboutHeroTitle || 'About Come Read with Junaid'}</h1>
        <p>{settings?.aboutHeroSubtitle || 'A curated space for thoughtful reading and deep conversations'}</p>
      </section>

      <section className="about-content">
        <div className="about-container">
          {settings?.aboutContent ? (
            <div
              className="about-rich-content"
              dangerouslySetInnerHTML={{
                __html: sanitizeAboutHtml(settings.aboutContent),
              }}
            />
          ) : hasStructuredAbout ? (
            <div className="about-rich-content">
              <section className="about-section">
                <h2>{settings?.aboutMissionTitle || 'Our Mission'}</h2>
                {settings?.aboutMissionBody && <p>{settings.aboutMissionBody}</p>}
              </section>

              <section className="about-section">
                <h2>{settings?.aboutCoverTitle || 'What We Cover'}</h2>
                <ul>
                  {splitListItems(settings?.aboutCoverItems || '').map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="about-section">
                <h2>{settings?.aboutValuesTitle || 'Our Values'}</h2>
                {settings?.aboutValuesBody && <p>{settings.aboutValuesBody}</p>}
              </section>
            </div>
          ) : (
            <p className="about-empty-state">About content has not been configured yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default About;
