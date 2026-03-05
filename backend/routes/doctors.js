const express = require('express');
const router = express.Router();
const {
  searchDoctors,
  getDoctorById,
  getDoctorSlots
} = require('../controllers/doctorsController');

// All public routes — no auth required
router.get('/search', searchDoctors);
router.get('/:id/slots', getDoctorSlots);
router.get('/:id', getDoctorById);

module.exports = router;