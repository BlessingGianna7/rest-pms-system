

const pool = require('../config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin user details - you can customize these or load from environment variables
const adminUser = {
  name: process.env.ADMIN_NAME || 'System Admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
  is_verified: true
};

const generateAdmin = async () => {
  try {
    console.log('Checking if admin user exists...');
    
    // Check if admin already exists
    const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', [adminUser.email]);
    
    if (checkResult.rowCount > 0) {
      console.log('Admin user already exists.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Insert admin user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [adminUser.name, adminUser.email, hashedPassword, adminUser.role, adminUser.is_verified]
    );
    
    const adminId = result.rows[0].id;
    
    // Log the action
    await pool.query(
      'INSERT INTO logs (user_id, action) VALUES ($1, $2)',
      [adminId, 'Admin user created by system']
    );
    
    console.log(`Admin user created successfully with email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password} (only shown during initial setup)`);
    
  } catch (error) {
    console.error('Error generating admin user:', error);
  } finally {
    // Close the pool
    pool.end();
  }
};

// Run the function if this script is executed directly
if (require.main === module) {
  generateAdmin().catch(console.error);
} else {
  // Export for use in other files
  module.exports = { generateAdmin };
}