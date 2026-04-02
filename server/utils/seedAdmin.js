const User = require('../models/User');

module.exports = async function seedAdmin() {
  try {
    const count = await User.countDocuments();
    if (count > 0) return;

    await User.create({
      email:    process.env.ADMIN_EMAIL    || 'admin@wallstreetinvestor.com',
      password: process.env.ADMIN_PASSWORD || 'changeme123',
      role:     'admin',
    });

    console.log('✅ Admin user seeded — change the password after first login');
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
};
