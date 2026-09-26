const Complaint = require('../models/Complaint');
const Citizen = require('../models/Citizen');
const Notification = require('../models/Notification');
const { generateComplaintId } = require('../services/idGenerator');
const { reverseGeocode } = require('../services/geocoding');
const { calculatePriority } = require('../services/priorityEngine');
const { uploadPhotoToSupabase, syncComplaintToSupabase } = require('../services/supabaseSync');

// Helper to construct photo URL
const getPhotoUrl = (req, filename) => {
  if (!filename) return '';
  return `/uploads/${filename}`;
};

/**
 * Suggest Priority based on Category and Description
 * POST /api/complaints/suggest-priority
 */
const suggestPriority = (req, res) => {
  try {
    const { category, description } = req.body;
    const result = calculatePriority(category, description);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Priority calculation failed.' });
  }
};

/**
 * Submit Complaint (Citizen)
 * POST /api/complaints
 */
const submitComplaint = async (req, res) => {
  try {
    const {
      description,
      category,
      priority,
      language,
      latitude,
      longitude,
      village,
      mandal,
      district,
      exactAddress
    } = req.body;

    // Validate Description
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a problem description.'
      });
    }

    // Validate Category
    const allowedCategories = [
      'Roads',
      'Street Lights',
      'Garbage',
      'Water',
      'Drainage',
      'Electricity',
      'Public Facilities',
      'Environment',
      'Other'
    ];
    if (!category || !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid complaint category.'
      });
    }

    // Validate Location
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Please allow location access to submit your complaint (GPS coordinates required).'
      });
    }

    // Determine or calculate Priority
    let finalPriority = priority;
    if (!['High', 'Moderate', 'Low'].includes(finalPriority)) {
      const calc = calculatePriority(category, description);
      finalPriority = calc.priority || 'Moderate';
    }

    // Geocoding resolution
    let locVillage = village;
    let locMandal = mandal;
    let locDistrict = district;
    let locAddress = exactAddress;

    if (!locVillage || !locMandal || !locDistrict || !locAddress) {
      const geo = await reverseGeocode(lat, lng);
      locVillage = locVillage || geo.village;
      locMandal = locMandal || geo.mandal;
      locDistrict = locDistrict || geo.district;
      locAddress = locAddress || geo.exactAddress;
    }

    // Photo upload (Supabase Storage with local fallback)
    let photoUrl = '';
    const supabasePhotoUrl = await uploadPhotoToSupabase(req.file, req.body.photoDataUrl);
    if (supabasePhotoUrl) {
      photoUrl = supabasePhotoUrl;
    } else if (req.file) {
      photoUrl = getPhotoUrl(req, req.file.filename);
    } else if (req.body.photoDataUrl && req.body.photoDataUrl.startsWith('data:image/')) {
      photoUrl = req.body.photoDataUrl;
    }

    // Citizen details
    const citizen = await Citizen.findById(req.user.id);
    const citizenName = citizen ? citizen.name : req.user.name || 'Citizen';
    const mobile = citizen ? citizen.mobile : req.user.mobile;

    // Unique sequential ID
    const complaintId = await generateComplaintId();
    const serverTimestamp = new Date();

    const newComplaint = await Complaint.create({
      complaintId,
      citizenId: req.user.id,
      citizenName,
      mobile,
      description: description.trim(),
      language: ['en', 'te', 'hi'].includes(language) ? language : citizen?.language || 'en',
      category,
      priority: finalPriority,
      photoUrl,
      location: {
        latitude: lat,
        longitude: lng,
        exactAddress: locAddress,
        village: locVillage,
        mandal: locMandal,
        district: locDistrict
      },
      status: 'SUBMITTED',
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: serverTimestamp,
          description: `Grievance submitted by citizen with GPS coordinates (${locVillage}, ${locMandal}).`,
          performedBy: `Citizen (${citizenName})`
        }
      ],
      createdAt: serverTimestamp
    });

    // Create in-app notification
    await Notification.create({
      recipientType: 'citizen',
      citizenId: req.user.id,
      complaintId,
      title: 'Complaint Registered Successfully',
      message: `Your complaint ${complaintId} under "${category}" has been registered. Initial status is SUBMITTED.`,
      status: 'SUBMITTED'
    });

    // Cloud Sync to Supabase PostgreSQL in background
    syncComplaintToSupabase(newComplaint).catch((e) =>
      console.warn('[Supabase Sync Error]', e.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaintId,
      complaint: newComplaint
    });
  } catch (err) {
    console.error('[JanSeva Complaint] Submit error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while submitting your complaint. Please try again.'
    });
  }
};

/**
 * Get Citizen's own complaints
 * GET /api/complaints/my
 */
const getMyComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const query = { citizenId: req.user.id };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }
    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ complaintId: reg }, { description: reg }, { category: reg }];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve your complaints.' });
  }
};

/**
 * Get Citizen Single Complaint Details
 * GET /api/complaints/my/:id
 */
const getMyComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('JS-')
      ? { complaintId: id, citizenId: req.user.id }
      : { _id: id, citizenId: req.user.id };

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or you do not have permission to view it.'
      });
    }

    return res.status(200).json({
      success: true,
      complaint
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load complaint details.' });
  }
};

/**
 * Officer Dashboard Real Metrics
 * GET /api/complaints/officer/dashboard
 */
const getOfficerDashboard = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayReports,
      highPriority,
      inProgress,
      done,
      pending,
      myAssigned,
      myCompleted,
      myPending,
      recentComplaints
    ] = await Promise.all([
      Complaint.countDocuments({ createdAt: { $gte: startOfToday } }),
      Complaint.countDocuments({
        priority: 'High',
        status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'] }
      }),
      Complaint.countDocuments({ status: 'IN PROGRESS' }),
      Complaint.countDocuments({ status: 'COMPLETED' }),
      Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'] } }),
      Complaint.countDocuments({ assignedOfficerId: req.user.id }),
      Complaint.countDocuments({ assignedOfficerId: req.user.id, status: 'COMPLETED' }),
      Complaint.countDocuments({
        assignedOfficerId: req.user.id,
        status: { $in: ['ASSIGNED', 'IN PROGRESS'] }
      }),
      Complaint.find().sort({ createdAt: -1 }).limit(6)
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        todayReports,
        highPriority,
        inProgress,
        done,
        pending
      },
      officerStats: {
        totalAssigned: myAssigned,
        totalCompleted: myCompleted,
        totalPending: myPending,
        completionCount: myCompleted
      },
      recentComplaints
    });
  } catch (err) {
    console.error('[JanSeva Officer] Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load officer dashboard statistics.' });
  }
};

/**
 * Officer Complaints List (Search, Filter, Sort)
 * GET /api/complaints/officer/list
 */
const getOfficerComplaintList = async (req, res) => {
  try {
    const { priority, category, status, sort, search, scope, dateFilter } = req.query;

    const query = {};

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        query.status = { $in: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'] };
      } else {
        query.status = status;
      }
    }

    if (scope === 'my-assigned') {
      query.assignedOfficerId = req.user.id;
    } else if (scope === 'my-completed') {
      query.assignedOfficerId = req.user.id;
      query.status = 'COMPLETED';
    } else if (scope === 'unassigned') {
      query.status = 'SUBMITTED';
    }

    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 3600000);
      query.createdAt = { $gte: weekAgo };
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 3600000);
      query.createdAt = { $gte: monthAgo };
    }

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintId: reg },
        { description: reg },
        { citizenName: reg },
        { mobile: reg },
        { 'location.village': reg },
        { 'location.mandal': reg },
        { 'location.exactAddress': reg }
      ];
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'priority-first') {
      // We will sort in-memory or by custom priority weight
      sortOption = { createdAt: -1 };
    }

    let complaints = await Complaint.find(query).sort(sortOption);

    if (sort === 'priority-first') {
      const weight = { High: 3, Moderate: 2, Low: 1 };
      complaints = complaints.sort((a, b) => {
        const diff = (weight[b.priority] || 0) - (weight[a.priority] || 0);
        if (diff !== 0) return diff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    console.error('[JanSeva Officer] Complaint list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints list.' });
  }
};

/**
 * Get Officer Complaint by ID
 * GET /api/complaints/officer/:id
 */
const getOfficerComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('JS-') ? { complaintId: id } : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    return res.status(200).json({
      success: true,
      complaint
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaint.' });
  }
};

/**
 * Assign Complaint to Officer Self
 * PATCH /api/complaints/officer/:id/assign
 */
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('JS-') ? { complaintId: id } : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    const officerName = req.user.name || 'Officer';
    const officerCode = req.user.officerId || 'OFF001';
    const now = new Date();

    complaint.status = 'ASSIGNED';
    complaint.assignedOfficerId = req.user.id;
    complaint.assignedOfficerCode = officerCode;
    complaint.assignedOfficerName = officerName;
    complaint.assignedAt = now;

    complaint.timeline.push({
      status: 'ASSIGNED',
      title: 'Assigned to Municipal Officer',
      timestamp: now,
      description: `Assigned to ${officerName} (${officerCode}) for on-ground inspection and resolution.`,
      performedBy: officerName
    });

    await complaint.save();

    // Sync status change to Supabase
    syncComplaintToSupabase(complaint).catch((e) =>
      console.warn('[Supabase Sync Error]', e.message)
    );

    // In-app notification for citizen
    await Notification.create({
      recipientType: 'citizen',
      citizenId: complaint.citizenId,
      complaintId: complaint.complaintId,
      title: 'Complaint Assigned',
      message: `Your complaint ${complaint.complaintId} has been assigned to ${officerName}.`,
      status: 'ASSIGNED'
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned to you.',
      complaint
    });
  } catch (err) {
    console.error('[JanSeva Officer] Assign error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign complaint.' });
  }
};

/**
 * Start Work on Complaint
 * PATCH /api/complaints/officer/:id/status
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, rejectionReason } = req.body;
    const query = id.startsWith('JS-') ? { complaintId: id } : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const officerName = req.user.name || 'Officer';
    const now = new Date();

    if (status === 'IN PROGRESS') {
      complaint.status = 'IN PROGRESS';
      complaint.startedAt = now;
      complaint.timeline.push({
        status: 'IN PROGRESS',
        title: 'Work In Progress',
        timestamp: now,
        description: note || 'Field repair crew dispatched; work is actively in progress.',
        performedBy: officerName
      });

      await Notification.create({
        recipientType: 'citizen',
        citizenId: complaint.citizenId,
        complaintId: complaint.complaintId,
        title: 'Work In Progress',
        message: `Your complaint ${complaint.complaintId} is now In Progress.`,
        status: 'IN PROGRESS'
      });
    } else if (status === 'REJECTED') {
      complaint.status = 'REJECTED';
      complaint.rejectionReason = rejectionReason || note || 'Complaint cannot be addressed as per municipal guidelines.';
      complaint.timeline.push({
        status: 'REJECTED',
        title: 'Complaint Rejected',
        timestamp: now,
        description: complaint.rejectionReason,
        performedBy: officerName
      });

      await Notification.create({
        recipientType: 'citizen',
        citizenId: complaint.citizenId,
        complaintId: complaint.complaintId,
        title: 'Complaint Rejected',
        message: `Your complaint ${complaint.complaintId} was rejected. Reason: ${complaint.rejectionReason}`,
        status: 'REJECTED'
      });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported status transition.' });
    }

    await complaint.save();

    // Sync status update to Supabase
    syncComplaintToSupabase(complaint).catch((e) =>
      console.warn('[Supabase Sync Error]', e.message)
    );

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      complaint
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint status.' });
  }
};

/**
 * Complete Complaint with Photo Proof & Resolution Note
 * PATCH /api/complaints/officer/:id/complete
 */
const completeComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote, completionPhotoDataUrl } = req.body;
    const query = id.startsWith('JS-') ? { complaintId: id } : { _id: id };

    const complaint = await Complaint.findOne(query);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    let completionPhotoUrl = '';
    const supabaseCompletionPhoto = await uploadPhotoToSupabase(req.file, completionPhotoDataUrl);
    if (supabaseCompletionPhoto) {
      completionPhotoUrl = supabaseCompletionPhoto;
    } else if (req.file) {
      completionPhotoUrl = getPhotoUrl(req, req.file.filename);
    } else if (completionPhotoDataUrl && completionPhotoDataUrl.startsWith('data:image/')) {
      completionPhotoUrl = completionPhotoDataUrl;
    }

    const officerName = req.user.name || 'Officer';
    const now = new Date();

    complaint.status = 'COMPLETED';
    complaint.completedAt = now;
    if (completionPhotoUrl) {
      complaint.completionPhotoUrl = completionPhotoUrl;
    }
    complaint.resolutionNote = resolutionNote ? resolutionNote.trim() : 'Problem solved and verified on site.';

    complaint.timeline.push({
      status: 'COMPLETED',
      title: 'Problem Solved & Completed',
      timestamp: now,
      description: complaint.resolutionNote,
      performedBy: officerName
    });

    await complaint.save();

    // Sync completion to Supabase
    syncComplaintToSupabase(complaint).catch((e) =>
      console.warn('[Supabase Sync Error]', e.message)
    );

    // In-app notification to Citizen
    await Notification.create({
      recipientType: 'citizen',
      citizenId: complaint.citizenId,
      complaintId: complaint.complaintId,
      title: 'Complaint Completed',
      message: `Your complaint ${complaint.complaintId} has been completed. View before & after photos in My Complaints.`,
      status: 'COMPLETED'
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint marked as completed with verification proof.',
      complaint
    });
  } catch (err) {
    console.error('[JanSeva Officer] Complete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete complaint.' });
  }
};

/**
 * Weekly & Monthly Reports Aggregation
 * GET /api/complaints/officer/reports
 */
const getReports = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600000);

    // Weekly stats
    const [weekReceived, weekSolved, weekPending, weekCategoryGroup] = await Promise.all([
      Complaint.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Complaint.countDocuments({ status: 'COMPLETED', completedAt: { $gte: sevenDaysAgo } }),
      Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'] } }),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Monthly stats
    const [monthReceived, monthSolved, monthPending, monthCategoryGroup, monthPriorityGroup, monthStatusGroup] = await Promise.all([
      Complaint.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Complaint.countDocuments({ status: 'COMPLETED', completedAt: { $gte: thirtyDaysAgo } }),
      Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'] } }),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      weekly: {
        received: weekReceived,
        solved: weekSolved,
        pending: weekPending,
        categories: weekCategoryGroup.map(item => ({ category: item._id, count: item.count }))
      },
      monthly: {
        received: monthReceived,
        solved: monthSolved,
        pending: monthPending,
        categories: monthCategoryGroup.map(item => ({ category: item._id, count: item.count })),
        priorities: monthPriorityGroup.map(item => ({ priority: item._id, count: item.count })),
        statuses: monthStatusGroup.map(item => ({ status: item._id, count: item.count }))
      }
    });
  } catch (err) {
    console.error('[JanSeva Reports] Aggregation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate analytical reports.' });
  }
};

/**
 * Get Citizen Notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const query = req.user.role === 'citizen'
      ? { recipientType: 'citizen', citizenId: req.user.id }
      : { recipientType: 'officer', officerId: req.user.id };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({ success: true, message: 'Notification marked read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

module.exports = {
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
  getReports,
  getNotifications,
  markNotificationRead
};
