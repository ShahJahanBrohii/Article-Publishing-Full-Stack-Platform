const router       = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const protect      = require('../middleware/protect');

const SETTINGS_KEY = 'global';

async function getSingletonSettings() {
  let settings = await SiteSettings.findOne({ settingsKey: SETTINGS_KEY });
  if (settings) return settings;

  settings = await SiteSettings.findOne();
  if (settings) {
    settings.settingsKey = SETTINGS_KEY;
    await settings.save();
    return settings;
  }

  return SiteSettings.create({ settingsKey: SETTINGS_KEY });
}

// GET /api/settings — public, used by frontend
router.get('/', async (req, res) => {
  try {
    const settings = await getSingletonSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/:id — admin only, get specific setting
router.get('/:id', protect, async (req, res) => {
  try {
    const settings = await SiteSettings.findById(req.params.id);
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — admin only, update settings
router.put('/', protect, async (req, res) => {
  try {
    const settings = await getSingletonSettings();
    Object.assign(settings, req.body, { settingsKey: SETTINGS_KEY });
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
