const router      = require('express').Router();
const HomeContent = require('../models/HomeContent');
const protect     = require('../middleware/protect');

// GET /api/home — public, used by frontend
router.get('/', async (req, res) => {
  let content = await HomeContent.findOne();
  if (!content) content = await HomeContent.create({});
  res.json(content);
});

// PUT /api/home — admin only
router.put('/', protect, async (req, res) => {
  let content = await HomeContent.findOne();
  if (!content) {
    content = await HomeContent.create(req.body);
  } else {
    Object.assign(content, req.body);
    await content.save();
  }
  res.json(content);
});

module.exports = router;
