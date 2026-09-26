const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'janseva_smart_citizen_complaint_management_system_jwt_secret_2026';

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization header missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid, expired, or malformed session token. Please log in again.'
    });
  }
};

const requireCitizen = (req, res, next) => {
  if (!req.user || req.user.role !== 'citizen') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Citizen role required.'
    });
  }
  next();
};

const requireOfficer = (req, res, next) => {
  if (!req.user || req.user.role !== 'officer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Municipal Officer role required.'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireCitizen,
  requireOfficer,
  JWT_SECRET
};
