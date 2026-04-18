require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const path       = require('path');
const seedAdmin  = require('./utils/seedAdmin');

const authRoutes        = require('./routes/auth');
const articleRoutes     = require('./routes/articles');
const subscriberRoutes  = require('./routes/subscribers');
const messageRoutes     = require('./routes/messages');
const homeRoutes        = require('./routes/home');
const publicRoutes      = require('./routes/public');
const generalRoutes     = require('./routes/general');
const settingsRoutes    = require('./routes/settings');
const uploadRoutes      = require('./routes/upload');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ;

// ─── Middleware ───────────────────────────────────────────────────────────

const normalizeOrigin = (value = '') => String(value).trim().replace(/\/$/, '');

const configuredOrigins = [
  ...(process.env.CLIENT_URLS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean),
  normalizeOrigin(process.env.CLIENT_URL || ''),
].filter(Boolean);

const allowedOrigins = configuredOrigins.length
  ? Array.from(new Set(configuredOrigins))
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients and same-origin requests without Origin header.
    if (!origin) return callback(null, true);
    const requestOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth',        authRoutes);
app.use('/api',             publicRoutes);   // /api/subscribe, /api/contact, /api/articles/:id
app.use('/api/articles',    articleRoutes);
app.use('/api/general',     generalRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/messages',    messageRoutes);
app.use('/api/home',        homeRoutes);
app.use('/api/settings',    settingsRoutes);
app.use('/api/upload',      uploadRoutes);

// ─── Health check ─────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ─── 404 ──────────────────────────────────────────────────────────────────

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ─── Error handler ────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ─── Connect DB then start ────────────────────────────────────────────────

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
      console.warn('⚠️ MONGO_URI is not set. Using local MongoDB at mongodb://127.0.0.1:27017/come-read-with-junaid');
    }
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

