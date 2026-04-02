const router  = require('express').Router();
const Message = require('../models/Message');
const protect = require('../middleware/protect');

router.use(protect);

// GET /api/messages
router.get('/', async (req, res) => {
  const { read, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (read !== undefined) filter.read = read === 'true';

  const total    = await Message.countDocuments(filter);
  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ messages, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/messages/:id
router.get('/:id', async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json(message);
});

// PUT /api/messages/:id/read — mark as read
router.put('/:id/read', async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json(message);
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json({ ok: true });
});

module.exports = router;
