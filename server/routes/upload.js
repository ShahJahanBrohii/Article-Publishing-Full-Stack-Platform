/**
 * routes/upload.js
 *
 * POST /api/upload/image
 *   Auth-protected (admin only)
 *   Accepts a single image file (field name: "image")
 *   Saves to /uploads/ on disk
 *   Returns { url: 'http://host/uploads/filename.jpg' }
 *
 * Setup:
 *   1. npm install multer
 *   2. In index.js add:
 *        const uploadRoutes = require('./routes/upload');
 *        app.use('/api/upload', uploadRoutes);
 *        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 */

const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const protect = require('../middleware/protect');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer: disk storage with sanitised unique filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 40);
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

// Images only
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, SVG).'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// POST /api/upload/image
router.post(
  '/image',
  protect,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          error: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB.' : err.message,
        });
      }
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file received.' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ ok: true, url, filename: req.file.filename });
  }
);

// DELETE /api/upload/image/:filename — optional cleanup
router.delete('/image/:filename', protect, (req, res) => {
  const { filename } = req.params;
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename.' });
  }
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found.' });
  fs.unlink(filePath, (err) =>
    err ? res.status(500).json({ error: 'Could not delete file.' }) : res.json({ ok: true })
  );
});

module.exports = router;
