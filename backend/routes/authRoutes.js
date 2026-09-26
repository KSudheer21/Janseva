const express = require('express');
const router = express.Router();
const {
  requestCitizenOtp,
  verifyCitizenOtp,
  officerLogin,
  getMe,
  updateCitizenProfile
} = require('../controllers/authController');
const { requireAuth, requireCitizen } = require('../middleware/auth');

// Citizen authentication
router.post('/citizen/request-otp', requestCitizenOtp);
router.post('/citizen/verify-otp', verifyCitizenOtp);

// Officer authentication
router.post('/officer/login', officerLogin);

// Current user profile
router.get('/me', requireAuth, getMe);
router.patch('/citizen/profile', requireAuth, requireCitizen, updateCitizenProfile);

module.exports = router;
