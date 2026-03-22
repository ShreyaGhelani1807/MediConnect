const prisma = require('../services/prismaClient');

// POST /api/appointments/book
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlotId,
      reasonForVisit,
      aiSymptomAnalysis,
      preConsultationChecklist
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlotId) {
      return res.status(400).json({
        error: 'doctorId, appointmentDate, and timeSlotId are required'
      });
    }

    // Get patient profile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Check if doctor exists and is accepting patients
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: String(doctorId) }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (!doctor.isAcceptingPatients) {
      return res.status(400).json({ error: 'Doctor is not accepting new patients' });
    }

    // Check if slot exists and belongs to this doctor
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        id: String(timeSlotId),
        doctorId: String(doctorId),
        isAvailable: true
      }
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found or unavailable' });
    }

    // Check if slot is already booked for this date
    const requestedDate = new Date(appointmentDate);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await prisma.appointment.findFirst({
      where: {
        doctorId: String(doctorId),
        timeSlotId: String(timeSlotId),
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { notIn: ['cancelled'] }
      }
    });

    if (existingBooking) {
      return res.status(409).json({
        error: 'This time slot is already booked for the selected date'
      });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: String(doctorId),
        appointmentDate: requestedDate,
        timeSlotId: String(timeSlotId),
        status: 'pending',
        reasonForVisit: reasonForVisit || null,
        aiSymptomAnalysis: aiSymptomAnalysis || null,
        preConsultationChecklist: preConsultationChecklist || null
      },
      include: {
        doctor: { include: { user: true } },
        timeSlot: true
      }
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        timeSlot: {
          startTime: appointment.timeSlot.startTime,
          endTime: appointment.timeSlot.endTime
        },
        doctor: {
          id: appointment.doctor.id,
          name: appointment.doctor.user.name,
          specialization: appointment.doctor.specialization,
          consultationFee: appointment.doctor.consultationFee,
          clinicAddress: appointment.doctor.clinicAddress,
          city: appointment.doctor.city
        },
        preConsultationChecklist: appointment.preConsultationChecklist
      }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

// PUT /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointmentId = String(req.params.id);
    const { status, doctorNotes } = req.body;

    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'status must be one of: confirmed, completed, cancelled'
      });
    }

    // Find appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Role-based permission check
    if (req.user.role === 'doctor') {
      // Verify this appointment belongs to this doctor
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.userId }
      });

      if (appointment.doctorId !== doctorProfile.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'patient') {
      // Patients can only cancel
      if (status !== 'cancelled') {
        return res.status(403).json({
          error: 'Patients can only cancel appointments'
        });
      }

      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: req.user.userId }
      });

      if (appointment.patientId !== patientProfile.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(doctorNotes && { doctorNotes })
      }
    });

    res.json({
      message: `Appointment ${status} successfully`,
      appointment: updated
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// POST /api/appointments/:id/rating
const rateAppointment = async (req, res) => {
  try {
    const appointmentId = String(req.params.id);
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    // Get patient profile
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user.userId }
    });

    // Find appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify appointment belongs to this patient
    if (appointment.patientId !== patientProfile.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only completed appointments can be rated
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        error: 'Only completed appointments can be rated'
      });
    }

    // Check if already rated
    const existingRating = await prisma.rating.findUnique({
      where: { appointmentId }
    });

    if (existingRating) {
      return res.status(409).json({ error: 'Appointment already rated' });
    }

    // Create rating
    const newRating = await prisma.rating.create({
      data: {
        appointmentId,
        patientId: patientProfile.id,
        doctorId: appointment.doctorId,
        rating: parseInt(rating),
        review: review || null
      }
    });

    // Recalculate doctor's average rating
    const allRatings = await prisma.rating.findMany({
      where: { doctorId: appointment.doctorId },
      select: { rating: true }
    });

    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await prisma.doctorProfile.update({
      where: { id: appointment.doctorId },
      data: {
        averageRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: allRatings.length
      }
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });

  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
  rateAppointment
};