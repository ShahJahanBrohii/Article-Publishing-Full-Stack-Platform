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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';
import SearchResults from './pages/SearchResults';

// Admin Entry Point
import AdminApp from './admin/AdminApp';

/**
 * Layout wrapper for public-facing pages.
 * Navbar and Footer only appear on reader pages — admin has its own shell.
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
      {/* ─── ADMIN BRANCH ────────────────────────────────────────────────── */}
      {/* Isolated from public Navbar/Footer. AdminApp handles its own layout. */}
      <Route path="/admin/*" element={<AdminApp />} />
      

      {/* ─── PUBLIC BRANCH ───────────────────────────────────────────────── */}
      <Route
        path="/*"
        element={
          <PublicLayout>
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="about"    element={<About />} />
              <Route path="contact"  element={<Contact />} />
              <Route path="subscribe" element={<Subscribe />} />

              {/* Legal pages */}
              <Route path="privacy"   element={<Privacy />} />
              <Route path="terms"     element={<Terms />} />
              <Route path="cookies"   element={<Cookies />} />
              <Route path="disclaimer" element={<Disclaimer />} />

              {/* Article detail */}
              <Route path="article/:id" element={<ArticleDetail />} />

              {/* Search — handles ?q=, ?tag=, ?section= */}
              <Route path="search" element={<SearchResults />} />

              {/* Section hubs */}
              <Route path="investing"                         element={<SectionPage sectionId="investing" />} />
              <Route path="investing/:topicSlug"              element={<SectionPage sectionId="investing" />} />
              <Route path="personal-finance"                  element={<SectionPage sectionId="personal-finance" />} />
              <Route path="personal-finance/:topicSlug"       element={<SectionPage sectionId="personal-finance" />} />
              <Route path="financial-education"               element={<SectionPage sectionId="financial-education" />} />
              <Route path="financial-education/:topicSlug"    element={<SectionPage sectionId="financial-education" />} />
              <Route path="guides"                            element={<SectionPage sectionId="guides" />} />
              <Route path="guides/:topicSlug"                 element={<SectionPage sectionId="guides" />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default App;