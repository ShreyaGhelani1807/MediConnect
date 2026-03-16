const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  updateAppointmentStatus,
  rateAppointment
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Book appointment — patients only
router.post('/book', protect, restrictTo('patient'), bookAppointment);

// Update status — both roles (with permission checks inside controller)
router.put('/:id/status', protect, updateAppointmentStatus);

// Rate appointment — patients only
router.post('/:id/rating', protect, restrictTo('patient'), rateAppointment);

module.exports = router;