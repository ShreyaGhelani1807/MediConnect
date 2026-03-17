const prisma = require('../services/prismaClient');
const { analyzeSymptoms, generateChecklist, aiChat } = require('../services/aiService');

// POST /api/ai/analyze-symptoms
const analyzeSymptomsEndpoint = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim().length < 10) {
      return res.status(400).json({
        error: 'Please describe your symptoms in at least 10 characters'
      });
    }

    // Get patient profile for age and city context
    const user = await prisma.user.findUnique({
      where: {
  id: String(req.user.userId)   // ← force String for MongoDB ObjectId
},
      include: { patientProfile: true }
    });

    const patientAge = user?.patientProfile?.age;
    const patientCity = user?.city;

    // Call Claude API
    console.log('Calling Claude API for symptom analysis...');
    const aiAnalysis = await analyzeSymptoms(symptoms, patientAge, patientCity);
    console.log('Claude API response received');

    // If emergency detected — skip doctor search, return emergency guidance
    if (aiAnalysis.emergency?.detected) {
      return res.json({
        aiAnalysis,
        doctors: [],
        isEmergency: true,
        message: 'Emergency detected. Please call 112 or go to nearest ER immediately.'
      });
    }

    // Auto-trigger doctor search from AI output
    const primarySpec = aiAnalysis.doctor_search_query?.primary_specialization;
    const urgencyFilter = aiAnalysis.doctor_search_query?.urgency_filter;

    let doctors = [];

    if (primarySpec) {
      // Build doctor search query
      const whereClause = {
        specialization: primarySpec,
        isAcceptingPatients: true,
        ...(patientCity && {
          city: {
            equals: patientCity,
            mode: 'insensitive'
          }
        })
      };

      doctors = await prisma.doctorProfile.findMany({
        where: whereClause,
        include: {
          user: true,
          timeSlots: {
            where: { isAvailable: true }
          }
        },
        orderBy: { averageRating: 'desc' },
        take: 6
      });

      // If no doctors in patient's city, search all cities
      if (doctors.length === 0 && patientCity) {
        doctors = await prisma.doctorProfile.findMany({
          where: {
            specialization: primarySpec,
            isAcceptingPatients: true
          },
          include: {
            user: true,
            timeSlots: { where: { isAvailable: true } }
          },
          orderBy: { averageRating: 'desc' },
          take: 6
        });
      }
    }

    // Format doctors for response
    const formattedDoctors = doctors.map(doc => ({
      id: doc.id,
      name: doc.user.name,
      specialization: doc.specialization,
      qualifications: doc.qualifications,
      experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee,
      city: doc.city,
      clinicAddress: doc.clinicAddress,
      profilePhoto: doc.profilePhoto,
      averageRating: doc.averageRating,
      totalReviews: doc.totalReviews,
      isAcceptingPatients: doc.isAcceptingPatients,
      availableSlots: doc.timeSlots.length
    }));

    res.json({
      aiAnalysis,
      doctors: formattedDoctors,
      isEmergency: false,
      searchedSpecialization: primarySpec,
      searchedCity: patientCity || 'All cities'
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);

    // Handle JSON parse error from Claude
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: 'AI response parsing failed. Please try again.'
      });
    }

    res.status(500).json({ error: 'Symptom analysis failed. Please try again.' });
  }
};

// POST /api/ai/generate-checklist
const generateChecklistEndpoint = async (req, res) => {
  try {
    const { specialization, symptoms, urgencyLevel } = req.body;

    if (!specialization || !symptoms) {
      return res.status(400).json({
        error: 'specialization and symptoms are required'
      });
    }

    console.log('Generating checklist for:', specialization);
    const checklist = await generateChecklist(
      specialization,
      symptoms,
      urgencyLevel || 'routine'
    );

    res.json({ checklist });

  } catch (error) {
    console.error('Checklist generation error:', error);
    res.status(500).json({ error: 'Checklist generation failed. Please try again.' });
  }
};

// POST /api/ai/chat
// Multi-turn symptom conversation. Client sends:
//   { history: [{role, content}], patientAge, patientCity }
// Max 3 user messages enforced here.
const chatEndpoint = async (req, res) => {
  try {
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'history array is required' });
    }

    // Count user messages
    const userMsgCount = history.filter(m => m.role === 'user').length;
    if (userMsgCount > 3) {
      return res.status(400).json({ error: 'Maximum 3 messages allowed per conversation' });
    }

    // Get patient context
    const user = await prisma.user.findUnique({
      where:   { id: String(req.user.userId) },
      include: { patientProfile: true }
    });
    const patientAge  = user?.patientProfile?.age;
    const patientCity = user?.city;

    const isLastTurn = userMsgCount >= 3;

    const aiResponse = await aiChat(history, patientAge, patientCity, isLastTurn);

    // If the AI returned a question, pass it through
    if (aiResponse.type === 'question') {
      return res.json({ type: 'question', text: aiResponse.text });
    }

    // The AI returned a result
    const aiAnalysis = aiResponse.aiAnalysis;

    // Emergency bypass — return immediately
    if (aiAnalysis?.emergency?.detected) {
      return res.json({ type: 'result', isEmergency: true, aiAnalysis, doctors: [] });
    }

    // Search for matching doctors
    const primarySpec = aiAnalysis?.doctor_search_query?.primary_specialization;
    let doctors = [];

    if (primarySpec) {
      doctors = await prisma.doctorProfile.findMany({
        where: {
          specialization:      primarySpec,
          isAcceptingPatients: true,
          verificationStatus:  'approved',
          ...(patientCity && { city: { equals: patientCity, mode: 'insensitive' } })
        },
        include: { user: true, timeSlots: { where: { isAvailable: true } } },
        orderBy: { averageRating: 'desc' },
        take: 6
      });

      if (doctors.length === 0 && patientCity) {
        doctors = await prisma.doctorProfile.findMany({
          where: { specialization: primarySpec, isAcceptingPatients: true, verificationStatus: 'approved' },
          include: { user: true, timeSlots: { where: { isAvailable: true } } },
          orderBy: { averageRating: 'desc' },
          take: 6
        });
      }
    }

    const formattedDoctors = doctors.map(doc => ({
      id: doc.id, name: doc.user.name, specialization: doc.specialization,
      qualifications: doc.qualifications, experienceYears: doc.experienceYears,
      consultationFee: doc.consultationFee, city: doc.city,
      clinicAddress: doc.clinicAddress, profilePhoto: doc.profilePhoto,
      averageRating: doc.averageRating, totalReviews: doc.totalReviews,
      isAcceptingPatients: doc.isAcceptingPatients, availableSlots: doc.timeSlots.length
    }));

    return res.json({ type: 'result', isEmergency: false, aiAnalysis, doctors: formattedDoctors });

  } catch (error) {
    console.error('AI chat error:', error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI response parsing failed. Please try again.' });
    }
    res.status(500).json({ error: 'AI chat failed. Please try again.' });
  }
};

module.exports = { analyzeSymptomsEndpoint, generateChecklistEndpoint, chatEndpoint };