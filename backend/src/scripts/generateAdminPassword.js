const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const User = require('../models/User');
const Log = require('../models/Log');

// Debug logging for environment variables
console.log('Admin configuration:');
console.log('ADMIN_NAME:', process.env.ADMIN_NAME);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('ADMIN_PASSWORD is set:', !!process.env.ADMIN_PASSWORD);

const adminUser = {
  name: process.env.ADMIN_NAME || 'System Admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
  is_verified: true
};

const generateAdmin = async () => {
  try {
    await sequelize.authenticate(); // check DB connection
    await sequelize.sync(); // make sure models are synced

    console.log('Checking if admin user exists...');

    const existing = await User.findOne({ where: { email: adminUser.email } });

    if (existing) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    const newAdmin = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role,
      is_verified: adminUser.is_verified
    });

    await Log.create({
      user_id: newAdmin.id,
      action: 'Admin user created by system'
    });

    console.log(`✅ Admin user created with email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);
  } catch (error) {
    console.error('❌ Error generating admin user:', error);
  } finally {
    await sequelize.close(); // clean exit
  }
};

if (require.main === module) {
  generateAdmin();
} else {
  module.exports = { generateAdmin };
}