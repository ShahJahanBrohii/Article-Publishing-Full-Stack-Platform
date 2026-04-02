const router     = require('express').Router();
const Subscriber = require('../models/Subscriber');
const protect    = require('../middleware/protect');

router.use(protect);

// GET /api/subscribers
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (search) filter.email = { $regex: search, $options: 'i' };

  const total       = await Subscriber.countDocuments(filter);
  const subscribers = await Subscriber.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ subscribers, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/subscribers/export — download CSV
router.get('/export', async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });

  const rows = [
    ['Email', 'Source', 'Active', 'Subscribed At'],
    ...subscribers.map((s) => [
      s.email,
      s.source,
      s.active ? 'Yes' : 'No',
      new Date(s.createdAt).toISOString(),
    ]),
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
  res.send(csv);
});

// DELETE /api/subscribers/:id
router.delete('/:id', async (req, res) => {
  const sub = await Subscriber.findByIdAndDelete(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscriber not found' });
  res.json({ ok: true });
});

module.exports = router;
