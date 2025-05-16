const { Op, literal } = require('sequelize');
const Vehicle = require('../models/Vehicle');
const Request = require('../models/Request');
const Log = require('../models/Log');

exports.createVehicle = async (req, res) => {
  const userId = req.user.id;
  const { license_plate, type } = req.body;

  try {
    const vehicle = await Vehicle.create({
      owner_id: userId,
      license_plate,
      type,
    });

    await Log.create({
      user_id: userId,
      action: `Vehicle ${license_plate} created`,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    console.error('Create vehicle error:', err);
    res
      .status(400)
      .json({ error: 'Plate number conflict or validation error', details: err.message });
  }
};

exports.getVehicles = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const pageNum = parseInt(req.query.page, 10) || 1;
  const limitNum = parseInt(req.query.limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;
  const search = req.query.search || '';

  try {
    const where = {};
    if (!isAdmin) {
      where.owner_id = userId;
    }

    if (search) {
      const like = { [Op.iLike]: `%${search}%` };
      where[Op.or] = isAdmin
        ? [
            { license_plate: like },
            { type: like },
            literal(`CAST("Vehicle"."id" AS TEXT) ILIKE '${like[Op.iLike]}'`)
          ]
        : [
            { license_plate: like },
            { type: like }
          ];
    }

    const approvalStatusAttr = [
      literal(`(
        SELECT "request_status"
        FROM "requests"
        WHERE "vehicle_id" = "Vehicle"."id"
          AND "request_status" = 'approved'
        LIMIT 1
      )`),
      'approval_status'
    ];

    const { rows, count } = await Vehicle.findAndCountAll({
      where,
      attributes: { include: [approvalStatusAttr] },
      order: [['id', 'ASC']],
      limit: limitNum,
      offset,
    });

    await Log.create({
      user_id: req.user.id,
      action: 'Vehicles list viewed',
    });

    res.json({
      data: rows,
      meta: {
        totalItems: count,
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getVehicleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    const where = { id };
    if (!isAdmin) where.owner_id = userId;

    const approvalStatusAttr = [
      literal(`(
        SELECT "request_status"
        FROM "requests"
        WHERE "vehicle_id" = "Vehicle"."id"
          AND "request_status" = 'approved'
        LIMIT 1
      )`),
      'approval_status'
    ];

    const vehicle = await Vehicle.findOne({
      where,
      attributes: { include: [approvalStatusAttr] },
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await Log.create({
      user_id: userId,
      action: `Vehicle ID ${id} viewed`,
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Get vehicle by ID error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { license_plate, type, size, other_attributes } = req.body;

  try {
    const where = { id };
    if (req.user.role !== 'admin') where.owner_id = userId;

    const vehicle = await Vehicle.findOne({ where });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (license_plate)     vehicle.license_plate = license_plate;
    if (type)              vehicle.type = type;
    if (size)              vehicle.size = size;
    if (other_attributes)  vehicle.other_attributes = other_attributes;

    await vehicle.save();

    await Log.create({
      user_id: userId,
      action: `Vehicle ${vehicle.license_plate} updated`,
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(400).json({ error: 'Plate conflict or validation error', details: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  try {
    const where = { id };
    if (!isAdmin) where.owner_id = userId;

    const vehicle = await Vehicle.findOne({ where });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await vehicle.destroy();

    await Log.create({
      user_id: userId,
      action: `Vehicle ${vehicle.license_plate} deleted`,
    });

    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
