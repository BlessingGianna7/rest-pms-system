// controllers/slotController.js
const { Op }       = require('sequelize');
const ParkingSlot  = require('../models/ParkingSlot');
const Log          = require('../models/Log');

exports.bulkCreateSlots = async (req, res) => {
  const userId = req.user.id;
  const { slots } = req.body;

  try {
   const slotsWithFreeStatus = slots.map(slot => ({
  ...slot,
  status: 'free'
}));
    const created = await ParkingSlot.bulkCreate(slotsWithFreeStatus, { returning: true });

    // Audit log
    await Log.create({
      user_id: userId,
      action:  `Bulk created ${created.length} slots`
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Bulk create slots error:', err);
    res
      .status(400)
      .json({ error: 'Slot number conflict or validation error', details: err.message });
  }
};

exports.getSlots = async (req, res) => {
  const pageNum  = parseInt(req.query.page,  10) || 1;
  const limitNum = parseInt(req.query.limit, 10) || 10;
  const offset   = (pageNum - 1) * limitNum;
  const search   = req.query.search || '';
  const isAdmin  = req.user.role === 'admin';

  try {
   
    const where = {};
    if (search) {
      const like = { [Op.iLike]: `%${search}%` };
      where[Op.or] = [
        { slot_number: { [Op.eq]: parseInt(search,10) || 0 } },
        { vehicle_type }
          ? { vehicle_type: like }
          : null
      ].filter(Boolean);
    }
    if (!isAdmin) {
      where.status = 'free';
    }

    // Query
    const { rows, count } = await ParkingSlot.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit: limitNum,
      offset
    });

    // Audit
    await Log.create({
      user_id: req.user.id,
      action:  'Slots list viewed'
    });

    res.json({
      data: rows,
      meta: {
        totalItems:  count,
        currentPage: pageNum,
        totalPages:  Math.ceil(count/limitNum),
        limit:       limitNum
      }
    });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = (({ slot_number,vehicle_type, location }) => 
    ({ slot_number, vehicle_type, location }))(req.body);

  try {
    const slot = await ParkingSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await slot.update(updates);

    await Log.create({
      user_id: userId,
      action:  `Slot ${slot.slot_number} updated`
    });

    res.json(slot);
  } catch (err) {
    console.error('Update slot error:', err);
    res
      .status(400)
      .json({ error: 'Slot number conflict or validation error', details: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const slot = await ParkingSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await slot.destroy();

    await Log.create({
      user_id: userId,
      action:  `Slot ${slot.slot_number} deleted`
    });

    res.json({ message: 'Slot deleted' });
  } catch (err) {
    console.error('Delete slot error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
