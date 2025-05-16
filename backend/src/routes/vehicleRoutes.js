const express = require('express');
const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/',    authenticate, createVehicle);
router.get('/',     authenticate, getVehicles);
router.put('/:id',  authenticate, updateVehicle);
router.delete('/:id',authenticate, deleteVehicle);

module.exports = router;
