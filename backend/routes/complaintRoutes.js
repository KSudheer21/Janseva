const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth, requireCitizen, requireOfficer } = require('../middleware/auth');
const {
  suggestPriority,
  submitComplaint,
  getMyComplaints,
  getMyComplaintById,
  getOfficerDashboard,
  getOfficerComplaintList,
  getOfficerComplaintById,
  assignComplaint,
  updateComplaintStatus,
  completeComplaint,
  getReports
} = require('../controllers/complaintController');

// Priority suggestion helper
router.post('/suggest-priority', suggestPriority);

// Citizen complaint endpoints
router.post('/', requireAuth, requireCitizen, upload.single('photo'), submitComplaint);
router.get('/my', requireAuth, requireCitizen, getMyComplaints);
router.get('/my/:id', requireAuth, requireCitizen, getMyComplaintById);

// Officer complaint endpoints - Specific static routes FIRST
router.get('/officer/dashboard', requireAuth, requireOfficer, getOfficerDashboard);
router.get('/officer/list', requireAuth, requireOfficer, getOfficerComplaintList);
router.get('/officer/reports', requireAuth, requireOfficer, getReports);

// Officer complaint endpoints - Parameterized routes
router.get('/officer/:id', requireAuth, requireOfficer, getOfficerComplaintById);
router.patch('/officer/:id/assign', requireAuth, requireOfficer, assignComplaint);
router.patch('/officer/:id/status', requireAuth, requireOfficer, updateComplaintStatus);
router.patch('/officer/:id/complete', requireAuth, requireOfficer, upload.single('completionPhoto'), completeComplaint);

module.exports = router;
