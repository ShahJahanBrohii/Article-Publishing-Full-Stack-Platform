const router  = require('express').Router();
const Article = require('../models/Article');
const protect = require('../middleware/protect');

// All article admin routes require auth
router.use(protect);

// GET /api/articles — list all with optional filters
router.get('/', async (req, res) => {
  const { status, section, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status)  filter.status  = status;
  if (section) filter.section = section;
  if (search)  filter.$or = [
    { title:   { $regex: search, $options: 'i' } },
    { topic:   { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
  ];

  const total    = await Article.countDocuments(filter);
  const articles = await Article.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-body');

  res.json({ articles, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

// POST /api/articles — create
router.post('/', async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/articles/:id — update
router.put('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json({ ok: true });
});

// PUT /api/articles/:id/publish — toggle publish status
router.put('/:id/publish', async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  article.status = article.status === 'published' ? 'draft' : 'published';
  if (article.status === 'published' && !article.publishedAt) {
    article.publishedAt = new Date();
  }
  await article.save();
  res.json(article);
});

module.exports = router;
