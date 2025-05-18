const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);

module.exports = router;
