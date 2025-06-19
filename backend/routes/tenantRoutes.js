const express = require('express');
const {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  getLastUpdatedTenant,
  processAadhaarImage
} = require('../controllers/tenantController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/last-updated').get(protect, getLastUpdatedTenant);

router
  .route('/')
  .get(protect, getTenants)
  .post(protect, createTenant);

router.route('/aadhaar-ocr').post(protect, upload.single('aadhaarImage'), processAadhaarImage);

router
  .route('/:id')
  .get(protect, getTenant)
  .put(protect, updateTenant)
  .delete(protect, deleteTenant);

module.exports = router;
