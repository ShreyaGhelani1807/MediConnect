const prisma = require('../services/prismaClient');

// GET /api/doctor/profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        doctorProfile: {
          include: { timeSlots: true }
        }
      }
    });

    if (!user || !user.doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      city: user.city,
      profile: user.doctorProfile
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/doctor/profile
const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, city,
      specialization, qualifications, experienceYears,
      consultationFee, clinicAddress, bio,
      profilePhoto, isAcceptingPatients
    } = req.body;

    // Update user table
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(city && { city })
      }
    });

    // Update doctor profile
    const updatedProfile = await prisma.doctorProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...(specialization && { specialization }),
        ...(qualifications && { qualifications }),
        ...(experienceYears && { experienceYears: parseInt(experienceYears) }),
        ...(consultationFee && { consultationFee: parseInt(consultationFee) }),
        ...(city && { city }),
        ...(clinicAddress && { clinicAddress }),
        ...(bio && { bio }),
        ...(profilePhoto && { profilePhoto }),
        ...(isAcceptingPatients !== undefined && { isAcceptingPatients })
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// PUT /api/doctor/slots — replace all slots for the doctor
const updateSlots = async (req, res) => {
  try {
    const { slots } = req.body;

    // slots = [{ dayOfWeek, startTime, endTime }, ...]
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'slots array is required' });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Delete all existing slots and recreate — simplest approach
    await prisma.timeSlot.deleteMany({
      where: { doctorId: doctorProfile.id }
    });

    const newSlots = await prisma.timeSlot.createMany({
      data: slots.map(slot => ({
        doctorId: doctorProfile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: true,
        slotDurationMinutes: slot.slotDurationMinutes || 30
      }))
    });

    res.json({
      message: 'Slots updated successfully',
      count: newSlots.count
    });

  } catch (error) {
    console.error('Update slots error:', error);
    res.status(500).json({ error: 'Failed to update slots' });
  }
};

// GET /api/doctor/appointments/today
const getTodayAppointments = async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfile.id,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        patient: {
          include: { user: true }
        },
        timeSlot: true
      },
      orderBy: { appointmentDate: 'asc' }
    });

    const formatted = appointments.map(apt => ({
      id: apt.id,
      appointmentDate: apt.appointmentDate,
      status: apt.status,
      reasonForVisit: apt.reasonForVisit,
      aiSymptomAnalysis: apt.aiSymptomAnalysis,
      timeSlot: {
        startTime: apt.timeSlot.startTime,
        endTime: apt.timeSlot.endTime
      },
      patient: {
        id: apt.patient.id,
        name: apt.patient.user.name,
        age: apt.patient.age,
        gender: apt.patient.gender,
        phone: apt.patient.user.phone
      }
    }));

    res.json({ appointments: formatted });

  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// GET /api/doctor/appointments/all
const getAllAppointments = async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorProfile.id },
      include: {
        patient: { include: { user: true } },
        timeSlot: true,
        rating: true
      },
      orderBy: { appointmentDate: 'desc' }
    });

    const formatted = appointments.map(apt => ({
      id: apt.id,
      appointmentDate: apt.appointmentDate,
      status: apt.status,
      reasonForVisit: apt.reasonForVisit,
      doctorNotes: apt.doctorNotes,
      timeSlot: {
        startTime: apt.timeSlot.startTime,
        endTime: apt.timeSlot.endTime
      },
      patient: {
        id: apt.patient.id,
        name: apt.patient.user.name,
        age: apt.patient.age,
        gender: apt.patient.gender
      },
      rating: apt.rating || null
    }));

    res.json({ appointments: formatted });

  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// GET /api/doctor/patients/:id
const getPatientById = async (req, res) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: true,
        appointments: {
          include: { timeSlot: true, rating: true },
          orderBy: { appointmentDate: 'desc' }
        }
      }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({
      id: patientProfile.id,
      name: patientProfile.user.name,
      email: patientProfile.user.email,
      phone: patientProfile.user.phone,
      city: patientProfile.user.city,
      age: patientProfile.age,
      gender: patientProfile.gender,
      bloodGroup: patientProfile.bloodGroup,
      medicalHistory: patientProfile.medicalHistory,
      emergencyContact: patientProfile.emergencyContact,
      appointments: patientProfile.appointments
    });

  } catch (error) {
    console.error('Get patient by id error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

// GET /api/doctor/analytics
const getAnalytics = async (req, res) => {
  try {
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const doctorId = doctorProfile.id;

    // Total patients this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthCount = await prisma.appointment.count({
      where: {
        doctorId,
        appointmentDate: { gte: startOfMonth },
        status: 'completed'
      }
    });

    // Monthly appointment volume (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: sixMonthsAgo },
        status: 'completed'
      },
      select: { appointmentDate: true }
    });

    // Group by month
    const monthlyVolume = {};
    monthlyAppointments.forEach(apt => {
      const key = `${apt.appointmentDate.getFullYear()}-${String(apt.appointmentDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyVolume[key] = (monthlyVolume[key] || 0) + 1;
    });

    // Peak hours
    const allAppointments = await prisma.appointment.findMany({
      where: { doctorId, status: 'completed' },
      include: { timeSlot: true }
    });

    const hourCounts = {};
    allAppointments.forEach(apt => {
      const hour = apt.timeSlot.startTime.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Average rating
    const ratings = await prisma.rating.findMany({
      where: { doctorId },
      select: { rating: true, createdAt: true }
    });

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    // Top reasons for visit
    const reasons = await prisma.appointment.findMany({
      where: { doctorId, reasonForVisit: { not: null } },
      select: { reasonForVisit: true }
    });

    res.json({
      thisMonthPatients: thisMonthCount,
      totalReviews: doctorProfile.totalReviews,
      averageRating: parseFloat(avgRating),
      monthlyVolume,
      peakHours: hourCounts,
      topReasons: reasons.map(r => r.reasonForVisit).slice(0, 20)
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSlots,
  getTodayAppointments,
  getAllAppointments,
  getPatientById,
  getAnalytics
};