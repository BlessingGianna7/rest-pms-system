const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Sequelize } = require('sequelize');

// Debug logging
console.log('Database connection variables:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD is set:', !!process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT || 5432);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 5432,
    dialect:  'postgres',
    logging:  false,
  }
);

module.exports = sequelize;