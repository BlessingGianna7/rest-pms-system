
const { DataTypes, Model, Op } = require('sequelize');
const sequelize = require('../config/database');

class Otp extends Model {}
Otp.init({
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  otp_code: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  expires_at: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  is_verified: {
    type:         DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  sequelize,
  modelName:  'Otp',
  tableName:  'otps',
  timestamps: false,
});

module.exports = Otp;
