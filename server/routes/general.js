
const router  = require('express').Router();
const Article = require('../models/Article');

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
module.exports = router;
