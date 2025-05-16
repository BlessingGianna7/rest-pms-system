// models/Vehicle.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Vehicle extends Model {}
Vehicle.init({
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  license_plate: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    true,
  },
  owner_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type:      DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName:  'Vehicle',
  tableName:  'vehicles',
  timestamps: false,
});

module.exports = Vehicle;
