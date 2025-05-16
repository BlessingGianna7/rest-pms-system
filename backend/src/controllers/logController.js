// controllers/logController.js
const { Op } = require('sequelize');
const Log     = require('../models/Log');

exports.getLogs = async (req, res) => {
  const userId    = req.user.id;
  const role      = req.user.role;
  const pageNum   = parseInt(req.query.page,  10) || 1;
  const limitNum  = parseInt(req.query.limit, 10) || 10;
  const offset    = (pageNum - 1) * limitNum;
  const search    = req.query.search || '';

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Build WHERE clause for search
    const where = {};
    if (search) {
      const possibleId = parseInt(search, 10);
      where[Op.or] = [
        { action:  { [Op.iLike]: `%${search}%` } },
        ...(Number.isInteger(possibleId) 
            ? [{ user_id: { [Op.eq]: possibleId } }] 
            : [])
      ];
    }

    // Fetch paginated logs
    const { rows, count } = await Log.findAndCountAll({
      where,
      order:  [['created_at','DESC']],
      limit:  limitNum,
      offset
    });

    // Audit this view
    await Log.create({ user_id: userId, action: 'Logs list viewed' });

    res.json({
      data: rows,
      meta: {
        totalItems:  count,
        currentPage: pageNum,
        totalPages:  Math.ceil(count / limitNum),
        limit:       limitNum
      }
    });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
