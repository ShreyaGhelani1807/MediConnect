const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prismaClient');

// Helper — generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, role, name, phone, city } = req.body;

    // Validate required fields
    if (!email || !password || !role || !name) {
      return res.status(400).json({
        error: 'email, password, role, and name are required'
      });
    }

    // Validate role
    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({
        error: 'role must be either patient or doctor'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user + profile in one transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        name,
        phone: phone || null,
        city: city || null,
        // Auto-create empty profile based on role
        ...(role === 'patient' && {
          patientProfile: { create: {} }
        }),
        ...(role === 'doctor' && {
          doctorProfile: {
            create: {
              specialization: req.body.specialization || 'General Physician',
              qualifications: req.body.qualifications || null,
              experienceYears: req.body.experienceYears || null,
              consultationFee: req.body.consultationFee || null,
              city: city || null,
              clinicAddress: req.body.clinicAddress || null,
              bio: req.body.bio || null,
            }
          }
        })
      },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        city: user.city,
        profileId: role === 'patient'
          ? user.patientProfile?.id
          : user.doctorProfile?.id
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

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required'
      });
    }

    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        city: user.city,
        profileId: user.role === 'patient'
          ? user.patientProfile?.id
          : user.doctorProfile?.id
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
      where: { id: req.user.userId },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      city: user.city,
      profile: user.role === 'patient'
        ? user.patientProfile
        : user.doctorProfile
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

module.exports = { register, login, getMe };