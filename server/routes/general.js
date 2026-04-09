
const router  = require('express').Router();
const Article = require('../models/Article');

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/articles — list all with optional filters
router.get('/', async (req, res) => {
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
