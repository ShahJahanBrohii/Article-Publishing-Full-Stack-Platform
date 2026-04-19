const User = require('../models/User');

module.exports = async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallstreetinvestor.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (existingAdmin) return;

    await User.create({
      email:    adminEmail,
      password: adminPassword,
      role:     'admin',
    });

    console.log('✅ Admin user seeded — change the password after first login');
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
};
