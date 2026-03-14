const express   = require('express');
const router    = express.Router();
const prisma    = require('../services/prismaClient');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/me
router.get('/me', adminAuth, async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalDoctors, totalPatients, totalAppointments, pendingCount] =
      await Promise.all([
        prisma.doctorProfile.count(),
        prisma.patientProfile.count(),
        prisma.appointment.count(),
        prisma.doctorProfile.count({ where: { verificationStatus: 'pending' } })
      ]);

    const recentPending = await prisma.doctorProfile.findMany({
      where:   { verificationStatus: 'pending' },
      take:    5,
      orderBy: { user: { createdAt: 'desc' } },
      include: { user: { select: { name: true, email: true, createdAt: true } } }
    });

    res.json({
      stats: { totalDoctors, totalPatients, totalAppointments, pendingCount },
      recentPending: recentPending.map(d => ({
        id:             d.id,
        name:           d.user.name,
        email:          d.user.email,
        specialization: d.specialization,
        createdAt:      d.user.createdAt
      }))
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/doctors?status=pending|approved|rejected
router.get('/doctors', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { verificationStatus: status.toLowerCase() } : {};

    const doctors = await prisma.doctorProfile.findMany({
      where,
      orderBy: { user: { createdAt: 'desc' } },
      include: {
        user: { select: { name: true, email: true, phone: true, city: true, createdAt: true } }
      }
    });

    // Count by status for summary
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.doctorProfile.count({ where: { verificationStatus: 'pending'  } }),
      prisma.doctorProfile.count({ where: { verificationStatus: 'approved' } }),
      prisma.doctorProfile.count({ where: { verificationStatus: 'rejected' } })
    ]);

    const formatted = doctors.map(d => ({
      id:                 d.id,
      name:               d.user.name,
      email:              d.user.email,
      phone:              d.user.phone,
      city:               d.user.city,
      specialization:     d.specialization,
      qualifications:     d.qualifications,
      experienceYears:    d.experienceYears,
      consultationFee:    d.consultationFee,
      clinicAddress:      d.clinicAddress,
      verificationStatus: d.verificationStatus,
      rejectionReason:    d.rejectionReason,
      createdAt:          d.user.createdAt
    }));

    res.json({
      doctors: formatted,
      summary: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
      total:   formatted.length
    });
  } catch (err) {
    console.error('Admin get doctors error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/doctors/:id
router.get('/doctors/:id', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;    // ← plain string ObjectId

    const doctor = await prisma.doctorProfile.findUnique({
      where:   { id },
      include: {
        user:   { select: { name: true, email: true, phone: true, city: true, createdAt: true } },
        _count: { select: { appointments: true, timeSlots: true } }
      }
    });

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    res.json({
      doctor: {
        id:                 doctor.id,
        name:               doctor.user.name,
        email:              doctor.user.email,
        phone:              doctor.user.phone,
        city:               doctor.user.city,
        specialization:     doctor.specialization,
        qualifications:     doctor.qualifications,
        experienceYears:    doctor.experienceYears,
        consultationFee:    doctor.consultationFee,
        clinicAddress:      doctor.clinicAddress,
        bio:                doctor.bio,
        verificationStatus: doctor.verificationStatus,
        rejectionReason:    doctor.rejectionReason,
        appointmentCount:   doctor._count.appointments,
        slotCount:          doctor._count.timeSlots,
        createdAt:          doctor.user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/doctors/:id/approve
router.patch('/doctors/:id/approve', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;    // ← plain string

    const doctor = await prisma.doctorProfile.findUnique({
      where:   { id },
      include: { user: { select: { name: true } } }
    });

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    if (doctor.verificationStatus === 'approved')
      return res.status(400).json({ error: 'Doctor is already approved' });

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data:  { verificationStatus: 'approved', rejectionReason: null }
    });

    res.json({
      message:            `Dr. ${doctor.user.name} has been approved`,
      verificationStatus: updated.verificationStatus
    });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/doctors/:id/reject
router.patch('/doctors/:id/reject', adminAuth, async (req, res) => {
  try {
    const id = req.params.id;    // ← plain string
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10)
      return res.status(400).json({ error: 'A rejection reason (min 10 chars) is required' });

    const doctor = await prisma.doctorProfile.findUnique({
      where:   { id },
      include: { user: { select: { name: true } } }
    });

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    if (doctor.verificationStatus === 'rejected')
      return res.status(400).json({ error: 'Doctor is already rejected' });

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data:  { verificationStatus: 'rejected', rejectionReason: reason.trim() }
    });

    res.json({
      message:            `Dr. ${doctor.user.name} has been rejected`,
      verificationStatus: updated.verificationStatus,
      rejectionReason:    updated.rejectionReason
    });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;