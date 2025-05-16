// controllers/userController.js
const bcrypt      = require('bcrypt');
const { Op }      = require('sequelize');
const User        = require('../models/User');
const Log         = require('../models/Log');

exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id','name','email','role']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await Log.create({ user_id: userId, action: 'User profile viewed' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name)  user.name  = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    await Log.create({ user_id: userId, action: 'Profile updated' });

    const { id, role } = user;
    res.json({ id, name: user.name, email: user.email, role });
  } catch (err) {
    console.error('Update profile error:', err);
    res
      .status(400)
      .json({ error: 'Email conflict or validation error', details: err.message });
  }
};

exports.getUsers = async (req, res) => {
  const pageNum  = parseInt(req.query.page,  10) || 1;
  const limitNum = parseInt(req.query.limit, 10) || 10;
  const offset   = (pageNum - 1) * limitNum;
  const search   = req.query.search || '';

  try {
    // WHERE for search
    const where = {};
    if (search) {
      const like = { [Op.iLike]: `%${search}%` };
      where[Op.or] = [
        { name:   like },
        { email:  like }
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id','name','email','role','is_verified'],
      order: [['id','ASC']],
      limit: limitNum,
      offset
    });

    await Log.create({ user_id: req.user.id, action: 'Users list viewed' });

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
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.deleteUser = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await Otp.destroy({ where: { user_id: id } });

    // Then delete the user
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Log.create({ user_id: userId, action: `User ${id} deleted` });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

