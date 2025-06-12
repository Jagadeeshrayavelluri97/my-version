const express = require('express');
const {
  registerAdmin,
  loginAdmin,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/adminController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
