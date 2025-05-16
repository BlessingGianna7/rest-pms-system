// models/Log.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Log extends Model {}
Log.init({
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  action: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type:         DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName:  'Log',
  tableName:  'logs',
  timestamps: false,
});

module.exports = Log;
