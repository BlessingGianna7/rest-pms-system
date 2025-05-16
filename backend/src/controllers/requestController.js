// controllers/requestController.js

const { Op }        = require('sequelize');
const Request = require('../models/Request');

const  Vehicle   = require('../models/Vehicle');
const  ParkingSlot = require('../models/ParkingSlot');
const  Log        = require('../models/Log');
const User       = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');
const sequelize      = require('../config/database');

exports.createRequest = async (req, res) => {
  const userId    = req.user.id;
  const { vehicle_id, slot_id } = req.body;

  try {
    // Ensure vehicle belongs to user if provided
    if (vehicle_id) {
      const vehicle = await Vehicle.findOne({
        where: { id: vehicle_id, owner_id: userId }
      });
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
    }

const slot = await ParkingSlot.findOne({
  where: { id: slot_id, status: 'free' }
});
if (!slot) {
  return res.status(404).json({ error: 'Slot not found or unavailable' });
}


    // Create the request with slot_id and optional vehicle_id
    const request = await Request.create({
      user_id : userId,
      slot_id,
      vehicle_id,
      request_status: 'pending'
    });

    // Log
await Log.create({
  user_id: userId,
  action: `Slot request created for vehicle ${vehicle_id || 'N/A'} and slot ${slot_id}`
});


    res.status(201).json(request);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.getRequests = async (req, res) => {
  const userId  = req.user.id;
  const isAdmin = req.user.role === 'admin';
  const page    = parseInt(req.query.page,  10) || 1;
  const limit   = parseInt(req.query.limit, 10) || 10;
  const offset  = (page - 1) * limit;
  const search  = req.query.search || '';

  try {
    // build base WHERE
    const where = {};
    if (!isAdmin) {
      where.user_id = userId;
    }
    if (search) {
      where[Op.or] = [
        { request_status: { [Op.iLike]: `%${search}%` } },
        // allow searching by license_plate via include
        sequelize.where(
          sequelize.col('Vehicle.license_plate'),
          { [Op.iLike]: `%${search}%` }
        )
      ];
    }

    // fetch with pagination and join on Vehicle
    const { rows, count } = await Request.findAndCountAll({
      where,
      include: [{
        model: Vehicle,
        attributes: ['license_plate', 'type']
      }],
      order: [['id','ASC']],
      limit,
      offset
    });

    // log the action
    await Log.create({
      user_id: userId,
      action:  'Slot requests list viewed'
    });

    res.json({
      data: rows,
      meta: {
        totalItems:  count,
        currentPage: page,
        totalPages:  Math.ceil(count / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  const userId    = req.user.id;
  const { id }    = req.params;
  const { vehicle_id } = req.body;

  try {
    // ensure vehicle belongs to user
    const vehicle = await Vehicle.findOne({
      where: { id: vehicle_id, owner_id: userId }
    });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // only pending requests can be updated
    const [updatedCount, [updatedReq]] = await Request.update(
      { vehicle_id },
      {
        where: {
          id,
          user_id:       userId,
          request_status:'pending'
        },
        returning: true
      }
    );
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Request not found or not editable' });
    }

    await Log.create({
      user_id: userId,
      action:  `Slot request ${id} updated`
    });

    res.json(updatedReq);
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // only pending requests can be deleted
    const request = await Request.findOne({
      where: { id, user_id: userId, request_status: 'pending' }
    });
    if (!request) {
      return res.status(404).json({ error: 'Request not found or not deletable' });
    }

    await request.destroy();

    await Log.create({
      user_id: userId,
      action:  `Slot request ${id} deleted`
    });

    res.json({ message: 'Request deleted' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.approveRequest = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const adminId = req.user.id;
  const { id } = req.params;

  const t = await sequelize.transaction();
try{


    const request = await Request.findOne({
      where: { id, request_status: 'pending' },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!request) {
      await t.rollback();
      return res.status(404).json({ error: 'Request not found or already processed' });
    }


    const vehicle = await Vehicle.findOne({
      where: { id: request.vehicle_id },
      transaction: t
    });
    if (!vehicle) {
      await t.rollback();
      return res.status(404).json({ error: 'Vehicle not found' });
    }

  
    const user = await User.findOne({
      where: { id: request.user_id },
      transaction: t
    });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }


    const slot = await ParkingSlot.findOne({
      where: {
  
        status: 'free'
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!slot) {
      await t.rollback();
      return res.status(400).json({ error: 'No free slots available' });
    }


    await request.update({
      request_status: 'approved',
      slot_id: slot.id,
      slot_number: slot.slot_number,
      approved_at: sequelize.fn('NOW')
    }, { transaction: t });

    await slot.update({ status: 'unavailable' }, { transaction: t });

    await t.commit();

    // Send email (outside transaction)
    let emailStatus = 'sent';
    try {
      await sendApprovalEmail(user.email, slot.slot_number, { license_plate: vehicle.license_plate }, slot.location);
    } catch (emailErr) {
      console.error('Approval email error:', emailErr);
      emailStatus = 'failed';
    }


    await Log.create({
      user_id: adminId,
      action: `Slot request ${id} approved, slot ${slot.slot_number}, email ${emailStatus}`
    });

    res.json({ message: 'Request approved', slot, emailStatus });

  } catch (err) {
    await t.rollback();
    console.error('Approve request error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const adminId = req.user.id;
  const { id }  = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  try {
    // load request + vehicle + user(email)
    const request = await Request.findOne({
      where: { id, request_status: 'pending' },
      include: [
        { model: Vehicle, attributes: ['type','license_plate'] },
        { model: User,    attributes: ['email'] }
      ]
    });
    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const slotLocRow = await ParkingSlot.findOne({
      where: {
        vehicle_type: request.Vehicle.type,
      },
      attributes: ['location']
    });
    const slotLocation = slotLocRow ? slotLocRow.location : 'unknown';

    // update request
    await request.update({ request_status: 'denied' });

    // REMOVE EMAIL LOGIC HERE

    await Log.create({
      user_id: adminId,
      action:  `Slot request ${id} rejected: ${reason}`
    });

    res.json({ message: 'Request rejected', request });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};