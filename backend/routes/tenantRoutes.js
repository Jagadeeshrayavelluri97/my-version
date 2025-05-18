const express = require('express');
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant
} = require('../controllers/tenantController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getTenants)
  .post(protect, createTenant);

router
  .route('/:id')
  .get(protect, getTenant)
  .put(protect, updateTenant)
  .delete(protect, deleteTenant);

module.exports = router;
