const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAppointments } = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All patient routes require login + patient role
router.use(protect);
router.use(restrictTo('patient'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/appointments', getAppointments);

module.exports = router;