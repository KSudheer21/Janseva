const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');
const Officer = require('../models/Officer');
const { JWT_SECRET } = require('../middleware/auth');

// In-memory OTP storage for non-demo simulation
const activeOtps = new Map();

/**
 * Citizen Request OTP
 * POST /api/auth/citizen/request-otp
 */
const requestCitizenOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const cleanMobile = String(mobile).trim();
    const isDemo = process.env.DEMO_OTP_ENABLED !== 'false';
    const demoOtp = process.env.DEMO_OTP || '123456';

    const generatedOtp = isDemo ? demoOtp : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store with 10 minutes expiry
    activeOtps.set(cleanMobile, {
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    console.log(`[JanSeva Auth] OTP for ${cleanMobile}: ${generatedOtp} (Demo mode: ${isDemo})`);

    return res.status(200).json({
      success: true,
      message: 'OTP has been dispatched successfully to your mobile number.',
      isDemo,
      demoOtp: isDemo ? demoOtp : undefined
    });
  } catch (err) {
    console.error('[JanSeva Auth] Error requesting OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while generating OTP. Please try again.'
    });
  }
};

/**
 * Citizen Verify OTP
 * POST /api/auth/citizen/verify-otp
 */
const verifyCitizenOtp = async (req, res) => {
  try {
    const { mobile, otp, name, language } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required.'
      });
    }

    const cleanMobile = String(mobile).trim();
    const cleanOtp = String(otp).trim();
    const isDemo = process.env.DEMO_OTP_ENABLED !== 'false';
    const demoOtp = process.env.DEMO_OTP || '123456';

    let isValidOtp = false;

    if (isDemo && cleanOtp === demoOtp) {
      isValidOtp = true;
    } else {
      const stored = activeOtps.get(cleanMobile);
      if (stored && stored.otp === cleanOtp && stored.expiresAt > Date.now()) {
        isValidOtp = true;
        activeOtps.delete(cleanMobile);
      }
    }

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please enter the correct verification code.'
      });
    }

    // Find or create Citizen record
    let citizen = await Citizen.findOne({ mobile: cleanMobile });
    if (!citizen) {
      citizen = await Citizen.create({
        mobile: cleanMobile,
        name: (name && name.trim()) || 'Citizen',
        language: ['en', 'te', 'hi'].includes(language) ? language : 'en'
      });
    } else if (name || language) {
      if (name && name.trim()) citizen.name = name.trim();
      if (['en', 'te', 'hi'].includes(language)) citizen.language = language;
      await citizen.save();
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: citizen._id,
        role: 'citizen',
        mobile: citizen.mobile,
        name: citizen.name,
        language: citizen.language
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      token,
      user: {
        id: citizen._id,
        name: citizen.name,
        mobile: citizen.mobile,
        language: citizen.language,
        role: 'citizen'
      }
    });
  } catch (err) {
    console.error('[JanSeva Auth] Error verifying OTP:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying OTP.'
    });
  }
};

/**
 * Officer Login
 * POST /api/auth/officer/login
 */
const officerLogin = async (req, res) => {
  try {
    const { officerId, password } = req.body;
    if (!officerId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Officer ID and password.'
      });
    }

    const cleanOfficerId = String(officerId).trim().toUpperCase();
    const officer = await Officer.findOne({ officerId: cleanOfficerId });

    if (!officer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Officer ID or password.'
      });
    }

    const isMatch = await officer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Officer ID or password.'
      });
    }

    const token = jwt.sign(
      {
        id: officer._id,
        role: 'officer',
        officerId: officer.officerId,
        name: officer.name,
        department: officer.department
      },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Officer authenticated successfully.',
      token,
      user: {
        id: officer._id,
        officerId: officer.officerId,
        name: officer.name,
        department: officer.department,
        designation: officer.designation,
        role: 'officer'
      }
    });
  } catch (err) {
    console.error('[JanSeva Auth] Officer login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during officer authentication.'
    });
  }
};

/**
 * Get current session user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    if (req.user.role === 'citizen') {
      const citizen = await Citizen.findById(req.user.id);
      if (!citizen) {
        return res.status(404).json({ success: false, message: 'Citizen profile not found.' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: citizen._id,
          name: citizen.name,
          mobile: citizen.mobile,
          language: citizen.language,
          address: citizen.address,
          role: 'citizen'
        }
      });
    } else if (req.user.role === 'officer') {
      const officer = await Officer.findById(req.user.id);
      if (!officer) {
        return res.status(404).json({ success: false, message: 'Officer profile not found.' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: officer._id,
          officerId: officer.officerId,
          name: officer.name,
          department: officer.department,
          designation: officer.designation,
          phone: officer.phone,
          email: officer.email,
          role: 'officer'
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Unknown role.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching session user.' });
  }
};

/**
 * Update Citizen profile details (Name, language)
 * PATCH /api/auth/citizen/profile
 */
const updateCitizenProfile = async (req, res) => {
  try {
    const { name, language, address } = req.body;
    const citizen = await Citizen.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found.' });
    }

    if (name) citizen.name = name.trim();
    if (language && ['en', 'te', 'hi'].includes(language)) citizen.language = language;
    if (address !== undefined) citizen.address = address.trim();

    await citizen.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: citizen._id,
        name: citizen.name,
        mobile: citizen.mobile,
        language: citizen.language,
        address: citizen.address,
        role: 'citizen'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

module.exports = {
  requestCitizenOtp,
  verifyCitizenOtp,
  officerLogin,
  getMe,
  updateCitizenProfile
};
