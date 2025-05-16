const express = require('express');
const { getLogs } = require('../controllers/logController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, isAdmin, getLogs);

module.exports = router;
