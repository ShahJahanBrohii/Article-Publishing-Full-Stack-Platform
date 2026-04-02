const router     = require('express').Router();
const Subscriber = require('../models/Subscriber');
const Message    = require('../models/Message');
const Article    = require('../models/Article');

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
  const { email, source = 'newsletter' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim(), source, active: true },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not save subscription' });
  }
});

// POST /api/contact
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await Message.create({ name, email, subject, message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not save message' });
  }
});

// GET /api/articles/:id/comments — public (kept simple, stored on article)
router.get('/articles/:id/comments', async (req, res) => {
  res.json([]);
});

// POST /api/articles/:id/comments
router.post('/articles/:id/comments', async (req, res) => {
  res.json({ ok: true, comment: { id: Date.now(), ...req.body, createdAt: new Date() } });
});

// GET /api/articles/:id — public article fetch
router.get('/articles/:id', async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      status: 'published',
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    article.views += 1;
    await article.save();
    res.json(article);
  } catch {
    res.status(404).json({ error: 'Article not found' });
  }
});

module.exports = router;
