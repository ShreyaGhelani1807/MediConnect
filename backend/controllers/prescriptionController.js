const prisma  = require('../services/prismaClient');
const crypto  = require('crypto');

// POST /api/prescriptions/appointments/:appointmentId
// Doctor only — add prescription after marking appointment complete
const addPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medicines, notes, reminderTimes } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: 'medicines array is required' });
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: String(appointmentId) },
      include: {
        doctor:  true,
        patient: { include: { user: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify this doctor owns the appointment
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Appointment must be completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Prescription can only be added to completed appointments' });
    }

    // Check if prescription already exists
    const existing = await prisma.prescription.findUnique({
      where: { appointmentId: String(appointmentId) }
    });

    if (existing) {
      return res.status(409).json({ error: 'Prescription already exists for this appointment' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: String(appointmentId),
        doctorId:      doctorProfile.id,
        patientId:     appointment.patientId,
        medicines,
        notes:         notes || null,
        reminderTimes: reminderTimes || [],
        medicineLog:   []
      }
    });

    res.status(201).json({
      message: 'Prescription added successfully',
      prescription
    });

  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ error: 'Failed to add prescription' });
  }
};

// GET /api/prescriptions/appointments/:appointmentId
// Doctor or patient — view prescription for an appointment
const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId: String(appointmentId) }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Verify caller is the doctor or patient on this appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: String(appointmentId) }
    });

    let authorized = false;
    if (req.user.role === 'doctor') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.userId }
      });
      authorized = doctorProfile && appointment.doctorId === doctorProfile.id;
    } else if (req.user.role === 'patient') {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: req.user.userId }
      });
      authorized = patientProfile && appointment.patientId === patientProfile.id;
    }

    if (!authorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ prescription });

  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
};

// GET /api/prescriptions/patient/all
// Patient only — get all their prescriptions
const getAllPatientPrescriptions = async (req, res) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: patientProfile.id },
      include: {
        appointment: {
          include: {
            doctor:   { include: { user: true } },
            timeSlot: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ prescriptions });

  } catch (error) {
    console.error('Get all patient prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

// GET /api/prescriptions/taken?token=TOKEN
// Public — mark a medicine as taken via email link
const markMedicineTaken = async (req, res) => {
  const { token } = req.query;

  const renderHTML = (title, message, isError = false) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — MediConnect</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F0F7FF; padding: 24px; }
    .card { background: #fff; border-radius: 24px; padding: 48px 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 8px 40px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06); }
    .icon { font-size: 52px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 800; color: #0B2545; margin-bottom: 12px; }
    p { font-size: 14px; color: #64748B; line-height: 1.65; }
    .brand { margin-top: 32px; font-size: 12px; font-weight: 700; color: #94A3B8; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? '⚠️' : '✅'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p class="brand">MEDICONNECT</p>
  </div>
</body>
</html>`;

  if (!token) {
    return res.status(400).send(renderHTML('Invalid Link', 'This link is missing a token. Please use the link from your reminder email.', true));
  }

  try {
    // Find prescription that has this token in medicineLog
    const prescriptions = await prisma.prescription.findMany({
      where: {
        medicineLog: {
          array_contains: [{ token }]
        }
      }
    });

    // medicineLog is a Json field — do manual filtering
    const allPrescriptions = await prisma.prescription.findMany();

    let targetPrescription = null;
    let targetEntry = null;

    for (const prescription of allPrescriptions) {
      const log = Array.isArray(prescription.medicineLog) ? prescription.medicineLog : [];
      const entry = log.find(e => e.token === token);
      if (entry) {
        targetPrescription = prescription;
        targetEntry = entry;
        break;
      }
    }

    if (!targetPrescription || !targetEntry) {
      return res.status(404).send(renderHTML('Invalid Link', 'This reminder link is not valid or has already been used. Please check your email for the correct link.', true));
    }

    // Check expiry
    if (new Date() > new Date(targetEntry.expiresAt)) {
      return res.status(410).send(renderHTML('Link Expired', 'This reminder link has expired (links are valid for 24 hours). Your next reminder will arrive on schedule.', true));
    }

    // Check if already taken
    if (targetEntry.taken) {
      return res.send(renderHTML('Already Marked', `You already marked <strong>${targetEntry.medicineName}</strong> as taken today. Great job staying on track! 💊`));
    }

    // Mark as taken
    const updatedLog = (Array.isArray(targetPrescription.medicineLog) ? targetPrescription.medicineLog : []).map(e =>
      e.token === token ? { ...e, taken: true } : e
    );

    await prisma.prescription.update({
      where: { id: targetPrescription.id },
      data:  { medicineLog: updatedLog }
    });

    return res.send(renderHTML('Medicine Taken! 💊', `<strong>${targetEntry.medicineName}</strong> has been marked as taken for today. Keep it up — staying consistent with your medication helps you recover faster.`));

  } catch (error) {
    console.error('Mark medicine taken error:', error);
    return res.status(500).send(renderHTML('Something went wrong', 'We encountered an error processing your request. Please try again or contact support.', true));
  }
};

module.exports = {
  addPrescription,
  getPrescriptionByAppointment,
  getAllPatientPrescriptions,
  markMedicineTaken
};
