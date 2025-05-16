const express = require('express');
const {
  bulkCreateSlots,
  getSlots,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/bulk', authenticate, isAdmin, bulkCreateSlots);
router.get('/',      authenticate, getSlots);
router.put('/:id',   authenticate, isAdmin, updateSlot);
router.delete('/:id',authenticate, isAdmin, deleteSlot);

module.exports = router;
