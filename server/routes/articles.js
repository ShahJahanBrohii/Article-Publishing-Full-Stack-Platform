const router  = require('express').Router();
const Article = require('../models/Article');
const protect = require('../middleware/protect');

// All article admin routes require auth
router.use(protect);


// POST /api/articles — create
router.post('/', async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/articles/admin/:id — admin read for full article data
router.get('/admin/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
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
