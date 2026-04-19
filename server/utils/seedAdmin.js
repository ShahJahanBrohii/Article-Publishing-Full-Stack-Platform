const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@wallstreetinvestor.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Admin already existed, credentials reset to seeded values');
      return;
    }

    await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('✅ Admin user seeded — change the password after first login');
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
}

module.exports = seedAdmin;

if (require.main === module) {
  require('dotenv').config();

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/come-read-with-junaid';

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log('✅ MongoDB connected for admin seed');
      await seedAdmin();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      try {
        await mongoose.disconnect();
      } catch (_err) {
        // Ignore disconnect errors when exiting the seed script.
      }
    });
}