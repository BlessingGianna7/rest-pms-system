// models/Request.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Request extends Model {}
Request.init({
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  user_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },  
  vehicle_id: { 
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  slot_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  request_status: {
    type:         DataTypes.ENUM('pending','approved','denied'),
    defaultValue: 'pending',
  }
}, {
  sequelize,
  modelName:  'Request',
  tableName:  'requests',
  timestamps: false,
});

module.exports = Request;
