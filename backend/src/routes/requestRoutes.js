const express = require('express');
const {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  approveRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/',            authenticate, createRequest);
router.get('/',             authenticate, getRequests);
router.put('/:id',          authenticate, updateRequest);
router.delete('/:id',       authenticate, deleteRequest);
router.put('/:id/approve',  authenticate, isAdmin, approveRequest);
router.put('/:id/reject',   authenticate, isAdmin, rejectRequest);

module.exports = router;
