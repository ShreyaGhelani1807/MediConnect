const express = require('express');
const router  = express.Router();
const {
  addPrescription,
  getPrescriptionByAppointment,
  getAllPatientPrescriptions,
  markMedicineTaken
} = require('../controllers/prescriptionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public — mark as taken via email link (no auth, token in query param)
router.get('/taken', markMedicineTaken);

// Patient — get all their prescriptions
router.get('/patient/all', protect, restrictTo('patient'), getAllPatientPrescriptions);

// Doctor or patient — get prescription for a specific appointment
router.get('/appointments/:appointmentId', protect, getPrescriptionByAppointment);

// Doctor only — add prescription to a completed appointment
router.post('/appointments/:appointmentId', protect, restrictTo('doctor'), addPrescription);

module.exports = router;
