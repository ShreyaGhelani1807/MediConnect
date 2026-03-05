const express = require('express');
const router = express.Router();
const {
  analyzeSymptomsEndpoint,
  generateChecklistEndpoint
} = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Only patients can analyze symptoms
router.post('/analyze-symptoms', protect, restrictTo('patient'), analyzeSymptomsEndpoint);

// Both roles can generate checklist
router.post('/generate-checklist', protect, generateChecklistEndpoint);

module.exports = router;