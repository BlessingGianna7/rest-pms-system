// models/ParkingSlot.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ParkingSlot extends Model {}
ParkingSlot.init({
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  slot_number: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  vehicle_type: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('free','occupied'),
    defaultValue: 'free',
  }
}, {
  sequelize,
  modelName:  'ParkingSlot',
  tableName:  'parking_slots',
  timestamps: false,
});

module.exports = ParkingSlot;
