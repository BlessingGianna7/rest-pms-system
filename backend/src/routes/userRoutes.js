const express = require('express');
const {
  getProfile,
  updateProfile,
  getUsers,
  deleteUser
} = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/profile',        authenticate,           getProfile);
router.put('/profile',        authenticate,           updateProfile);
router.get('/',               authenticate, isAdmin, getUsers);
router.delete('/:id',         authenticate, isAdmin, deleteUser);

module.exports = router;
