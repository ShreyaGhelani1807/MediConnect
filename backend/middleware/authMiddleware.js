const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      userId: String(decoded.userId)   // ← always String for MongoDB
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. ${roles.join(' or ')} role required.`
      });
    }
    next();
  };
};

const requireApprovedDoctor = async (req, res, next) => {
  try {
    const prisma = require('../services/prismaClient');
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.userId },
      select: { verificationStatus: true }
    });

    if (!doctorProfile) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    if (doctorProfile.verificationStatus !== 'approved') {
      return res.status(403).json({
        error: 'Doctor account is not approved yet.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify doctor approval status' });
  }
};

module.exports = { protect, restrictTo, requireApprovedDoctor };