const prisma = require('../services/prismaClient');

// GET /api/doctors/search
const searchDoctors = async (req, res) => {
  try {
    const { specialization, city, minRating, maxFee, sortBy = 'rating' } = req.query;

    const whereClause = {
      isAcceptingPatients: true,
      verificationStatus: 'approved',
      ...(specialization && { specialization: { equals: specialization, mode: 'insensitive' } }),
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
      ...(minRating && { averageRating: { gte: parseFloat(minRating) } }),
      ...(maxFee && { consultationFee: { lte: parseInt(maxFee) } })
    };

    let orderBy = {};
    if (sortBy === 'rating')      orderBy = { averageRating: 'desc' };
    else if (sortBy === 'fee_low')  orderBy = { consultationFee: 'asc' };
    else if (sortBy === 'fee_high') orderBy = { consultationFee: 'desc' };
    else if (sortBy === 'experience') orderBy = { experienceYears: 'desc' };
    else orderBy = { averageRating: 'desc' };

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        timeSlots: { where: { isAvailable: true } }
      },
      orderBy
    });

    const formatted = doctors.map(doc => ({
      id:                 doc.id,            // ← String ObjectId, no parseInt
      name:               doc.user.name,
      specialization:     doc.specialization,
      qualifications:     doc.qualifications,
      experienceYears:    doc.experienceYears,
      consultationFee:    doc.consultationFee,
      city:               doc.city,
      clinicAddress:      doc.clinicAddress,
      profilePhoto:       doc.profilePhoto,
      averageRating:      doc.averageRating,
      totalReviews:       doc.totalReviews,
      isAcceptingPatients: doc.isAcceptingPatients,
      availableSlots:     doc.timeSlots.length
    }));

    res.json({ count: formatted.length, doctors: formatted });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;   // ← plain string, no parseInt

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: {
        user: true,
        timeSlots: {
          where: { isAvailable: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        },
        ratings: {
          include: {
            appointment: {
              include: { patient: { include: { user: true } } }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const reviews = doctor.ratings.map(r => ({
      id:          r.id,
      rating:      r.rating,
      review:      r.review,
      createdAt:   r.createdAt,
      patientName: r.appointment.patient.user.name
    }));

    res.json({
      id:                 doctor.id,
      name:               doctor.user.name,
      email:              doctor.user.email,
      specialization:     doctor.specialization,
      qualifications:     doctor.qualifications,
      experienceYears:    doctor.experienceYears,
      consultationFee:    doctor.consultationFee,
      city:               doctor.city,
      clinicAddress:      doctor.clinicAddress,
      bio:                doctor.bio,
      profilePhoto:       doctor.profilePhoto,
      averageRating:      doctor.averageRating,
      totalReviews:       doctor.totalReviews,
      isAcceptingPatients: doctor.isAcceptingPatients,
      timeSlots:          doctor.timeSlots,
      reviews
    });

  } catch (error) {
    console.error('Get doctor by id error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
const getDoctorSlots = async (req, res) => {
  try {
    const doctorId = req.params.id;   // ← plain string
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    const recurringSlots = await prisma.timeSlot.findMany({
      where: { doctorId, dayOfWeek, isAvailable: true },
      orderBy: { startTime: 'asc' }
    });

    if (recurringSlots.length === 0) {
      return res.json({ date, dayOfWeek, availableSlots: [], message: 'Doctor is not available on this day' });
    }

    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay   = new Date(date); endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['cancelled'] }
      },
      select: { timeSlotId: true }
    });

    const bookedSlotIds = bookedAppointments.map(a => a.timeSlotId);

    const slots = recurringSlots.map(slot => ({
      id:        slot.id,
      startTime: slot.startTime,
      endTime:   slot.endTime,
      isBooked:  bookedSlotIds.includes(slot.id)
    }));

    res.json({ date, dayOfWeek, availableSlots: slots });

  } catch (error) {
    console.error('Get doctor slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

module.exports = { searchDoctors, getDoctorById, getDoctorSlots };