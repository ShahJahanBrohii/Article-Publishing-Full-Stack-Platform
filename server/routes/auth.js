const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const protect = require('../middleware/protect');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: { id: user._id, email: user.email, role: user.role },
  });
});

// GET /api/auth/me — verify token & return current user
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/password — change password
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both fields are required' });
  }

  const user  = await User.findById(req.user._id);
  const match = await user.comparePassword(currentPassword);
  if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();
  res.json({ ok: true });
});

module.exports = router;
