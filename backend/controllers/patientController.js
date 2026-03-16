const prisma = require('../services/prismaClient');

// GET /api/patient/profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { patientProfile: true }
    });

    if (!user || !user.patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      city: user.city,
      profile: user.patientProfile
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/patient/profile
const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, city,
      age, gender, bloodGroup,
      medicalHistory, emergencyContact, profilePhoto
    } = req.body;

    // Update user table fields
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(city && { city })
      }
    });

    // Update patient profile fields
    const updatedProfile = await prisma.patientProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...(age && { age: parseInt(age) }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodGroup }),
        ...(medicalHistory && { medicalHistory }),
        ...(emergencyContact && { emergencyContact }),
        ...(profilePhoto && { profilePhoto })
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// GET /api/patient/appointments
const getAppointments = async (req, res) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: {
          include: { user: true }
        },
        timeSlot: true,
        rating: true
      },
      orderBy: { appointmentDate: 'desc' }
    });

    // Format response
    const formatted = appointments.map(apt => ({
      id: apt.id,
      appointmentDate: apt.appointmentDate,
      status: apt.status,
      reasonForVisit: apt.reasonForVisit,
      aiSymptomAnalysis: apt.aiSymptomAnalysis,
      preConsultationChecklist: apt.preConsultationChecklist,
      doctorNotes: apt.doctorNotes,
      createdAt: apt.createdAt,
      timeSlot: {
        startTime: apt.timeSlot.startTime,
        endTime: apt.timeSlot.endTime
      },
      doctor: {
        id: apt.doctor.id,
        name: apt.doctor.user.name,
        specialization: apt.doctor.specialization,
        consultationFee: apt.doctor.consultationFee,
        city: apt.doctor.city,
        profilePhoto: apt.doctor.profilePhoto
      },
      rating: apt.rating || null
    }));

    res.json({ appointments: formatted });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

module.exports = { getProfile, updateProfile, getAppointments };