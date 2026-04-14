const router  = require('express').Router();
const Article = require('../models/Article');
const protect = require('../middleware/protect');

// All article admin routes require auth
router.use(protect);

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/articles — admin list (with filters for status, search, pagination)
router.get('/', async (req, res) => {
  try {
    const { status, section, topic, search, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    const andConditions = [];

    if (status)  filter.status  = status;
    if (section) filter.section = section;
    if (topic)   filter.topic   = { $regex: topic, $options: 'i' };
    if (search) {
      const escaped = escapeRegExp(search);
      andConditions.push({
        $or: [
          { title:   { $regex: escaped, $options: 'i' } },
          { topic:   { $regex: escaped, $options: 'i' } },
          { excerpt: { $regex: escaped, $options: 'i' } },
          { tags:    { $regex: escaped, $options: 'i' } },
        ],
      });
    }

    if (tag) {
      const escaped = escapeRegExp(tag);
      andConditions.push({ tags: { $regex: escaped, $options: 'i' } });
    }

    if (andConditions.length === 1) {
      Object.assign(filter, andConditions[0]);
    } else if (andConditions.length > 1) {
      filter.$and = andConditions;
    }

    const total    = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ articles, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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
