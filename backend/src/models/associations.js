
const Request = require('./Request');
const Vehicle = require('./Vehicle');
const User = require('./User');
const ParkingSlot = require('./ParkingSlot');

// Associations
User.hasMany(Request, { foreignKey: 'user_id' });
Request.belongsTo(User, { foreignKey: 'user_id' });

Vehicle.hasMany(Request, { foreignKey: 'vehicle_id' });
Request.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

ParkingSlot.hasMany(Request, { foreignKey: 'slot_id' });
Request.belongsTo(ParkingSlot, { foreignKey: 'slot_id' });

module.exports = { Request, Vehicle, User, ParkingSlot };
