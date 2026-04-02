import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import SectionPage from './pages/SectionPage';
import Subscribe from './pages/Subscribe';
import NotFound from './pages/NotFound';

// Admin Entry Point
import AdminApp from './admin/AdminApp';

/**
 * Layout wrapper for public-facing pages.
 * This ensures Navbar and Footer only appear on reader pages.
 */
const PublicLayout = ({ children }) => (
  <div className="app">
    <Navbar />
    <main className="public-content">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* ─── ADMIN BRANCH ─── */}
      {/* Isolated from public Navbar/Footer. AdminApp handles its own layout. */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* ─── PUBLIC BRANCH ─── */}
      {/* All reader routes are nested here within the PublicLayout */}
      <Route
        path="/*"
        element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="article/:id" element={<ArticleDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="subscribe" element={<Subscribe />} />

              {/* Section Pages */}
              <Route path="investing" element={<SectionPage sectionId="investing" />} />
              <Route path="investing/:topicSlug" element={<SectionPage sectionId="investing" />} />
              <Route path="personal-finance" element={<SectionPage sectionId="personal-finance" />} />
              <Route path="personal-finance/:topicSlug" element={<SectionPage sectionId="personal-finance" />} />
              <Route path="financial-education" element={<SectionPage sectionId="financial-education" />} />
              <Route path="financial-education/:topicSlug" element={<SectionPage sectionId="financial-education" />} />
              <Route path="guides" element={<SectionPage sectionId="guides" />} />
              <Route path="guides/:topicSlug" element={<SectionPage sectionId="guides" />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default App;