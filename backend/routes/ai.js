// ai.js (change this comment per file)
const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ message: 'ai route working' });
});

module.exports = router;