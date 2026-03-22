const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateSlots,
  getTodayAppointments,
  getAllAppointments,
  getPatientById,
  getAnalytics,
  changePassword
} = require('../controllers/doctorController');
const { protect, restrictTo, requireApprovedDoctor } = require('../middleware/authMiddleware');

// All doctor routes require login + doctor role
router.use(protect);
router.use(restrictTo('doctor'));
router.use(requireApprovedDoctor);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/slots', updateSlots);
router.get('/appointments/today', getTodayAppointments);
router.get('/appointments/all', getAllAppointments);
router.get('/patients/:id', getPatientById);
router.get('/analytics', getAnalytics);

module.exports = router;