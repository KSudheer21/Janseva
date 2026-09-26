const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getNotifications, markNotificationRead } = require('../controllers/complaintController');

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markNotificationRead);

module.exports = router;
