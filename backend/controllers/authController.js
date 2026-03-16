const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../services/prismaClient');

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, role, name, phone, city } = req.body;

    if (!email || !password || !role || !name)
      return res.status(400).json({ error: 'email, password, role, and name are required' });

    if (!['patient', 'doctor'].includes(role))
      return res.status(400).json({ error: 'role must be patient or doctor' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email, passwordHash, role, name,
        phone: phone || null,
        city:  city  || null,
        ...(role === 'patient' && {
          patientProfile: { create: {} }
        }),
        ...(role === 'doctor' && {
          doctorProfile: {
            create: {
              specialization:  req.body.specialization  || 'General Physician',
              qualifications:  req.body.qualifications  || null,
              experienceYears: req.body.experienceYears || null,
              consultationFee: req.body.consultationFee || null,
              city:            city || null,
              clinicAddress:   req.body.clinicAddress   || null,
              bio:             req.body.bio             || null,
              degreeImage:     req.body.degreeImage     || null,  // ← base64 image
              personalEmail:   email,                             // ← save original email
              verificationStatus: 'pending',
            }
          }
        })
      },
      include: { patientProfile: true, doctorProfile: true }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id:       user.id,
        email:    user.email,
        role:     user.role,
        name:     user.name,
        city:     user.city,
        profileId: role === 'patient' ? user.patientProfile?.id : user.doctorProfile?.id,
        ...(role === 'doctor' && {
          verificationStatus: user.doctorProfile?.verificationStatus  // 'pending'
        })
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true, doctorProfile: true }
    });

    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        name:      user.name,
        city:      user.city,
        profileId: user.role === 'patient' ? user.patientProfile?.id : user.doctorProfile?.id,
        ...(user.role === 'doctor' && {
          verificationStatus: user.doctorProfile?.verificationStatus,
          rejectionReason:    user.doctorProfile?.rejectionReason || null
        })
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: String(req.user.userId) },
      include: { patientProfile: true, doctorProfile: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id:      user.id,
      email:   user.email,
      role:    user.role,
      name:    user.name,
      phone:   user.phone,
      city:    user.city,
      profile: user.role === 'patient' ? user.patientProfile : user.doctorProfile,
      ...(user.role === 'doctor' && {
        verificationStatus: user.doctorProfile?.verificationStatus,
        rejectionReason:    user.doctorProfile?.rejectionReason || null
      })
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { register, login, getMe };