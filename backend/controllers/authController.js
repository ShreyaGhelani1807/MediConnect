const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../services/prismaClient');
const { sendForgotPasswordEmail } = require('../services/emailService');

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

    const token = role === 'patient' ? generateToken(user.id, user.role) : null;

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

    if (user.role === 'doctor' && user.doctorProfile?.verificationStatus !== 'approved') {
      return res.status(403).json({
        error: 'Your doctor account is not approved yet. Please wait for admin verification.',
        verificationStatus: user.doctorProfile?.verificationStatus,
        rejectionReason: user.doctorProfile?.rejectionReason || null
      });
    }

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

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  // Always return the SAME generic response — never reveal whether email exists
  const GENERIC = { message: 'If that email is registered, a temporary password has been sent.' };

  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Still return 200 — don't reveal whether email exists
      return res.json(GENERIC);
    }

    // Generate 10-char temp password: 1 upper + 1 lower + 1 digit + 1 special + 6 random
    const upper   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';
    const special = '@#$!';
    const all     = upper + lower + digits + special;

    let tempPwd = '';
    tempPwd += upper[Math.floor(Math.random() * upper.length)];
    tempPwd += lower[Math.floor(Math.random() * lower.length)];
    tempPwd += digits[Math.floor(Math.random() * digits.length)];
    tempPwd += special[Math.floor(Math.random() * special.length)];
    for (let i = 0; i < 6; i++) tempPwd += all[Math.floor(Math.random() * all.length)];

    // Fisher-Yates shuffle
    const arr = tempPwd.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const newPassword = arr.join('');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { passwordHash } });

    await sendForgotPasswordEmail({ to: email, name: user.name, tempPassword: newPassword });

    return res.json(GENERIC);

  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return generic to avoid leaking info
    return res.json(GENERIC);
  }
};

module.exports = { register, login, getMe, forgotPassword };