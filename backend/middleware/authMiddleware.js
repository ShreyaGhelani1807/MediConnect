const jwt = require('jsonwebtoken');

// Protect — verifies JWT and attaches user to request
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { userId, role }
    next();

  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Restrict to specific roles
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

module.exports = { protect, restrictTo };