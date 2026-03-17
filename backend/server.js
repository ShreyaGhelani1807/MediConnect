const express      = require('express');
const cors         = require('cors');
const dotenv       = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const { startReminderCron } = require('./services/reminderCron');

dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'MediConnect API is running', version: '1.0.0', status: 'healthy' });
});

// ── Route groups ───────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/patient',       require('./routes/patient'));
app.use('/api/doctor',        require('./routes/doctor'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler (must be AFTER routes) ──────────────────
app.use(errorHandler);

// ── Start server (only in local dev, not on Vercel) ────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 MediConnect API running on port ${PORT}`);
    startReminderCron();          // ← Start medicine reminder cron
  });
}

module.exports = app;