import React from 'react';
import '../styles/About.css';

function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <h1>About Come Read with Junaid</h1>
        <p>A curated space for thoughtful reading and deep conversations</p>
      </section>

      <section className="about-content">
        <div className="about-container">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              We believe in the transformative power of reading. In an age of endless content, 
              we curate thoughtfully selected articles on history, philosophy, culture, and 
              the beauty of the written word.
            </p>
          </div>

          <div className="about-section">
            <h2>What We Cover</h2>
            <ul>
              <li>History & Cultural Traditions</li>
              <li>Philosophy & Ideas</li>
              <li>Literature & Poetry</li>
              <li>Science & Discovery</li>
              <li>Personal Essays & Reflections</li>
            </ul>
          </div>

          <div className="about-section">
            <h2>Our Values</h2>
            <p>
              Quality over quantity. Depth over virality. Every article is chosen because 
              it has something meaningful to offer — something that moves the mind and enriches the soul.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
