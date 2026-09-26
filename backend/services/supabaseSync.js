const fs = require('fs');
const { supabase, uploadToStorage } = require('../config/supabase');

/**
 * Upload an uploaded multer file or base64 dataUrl to Supabase Storage
 */
async function uploadPhotoToSupabase(file, dataUrl) {
  try {
    if (file && file.path && fs.existsSync(file.path)) {
      const buffer = fs.readFileSync(file.path);
      const url = await uploadToStorage(buffer, file.originalname || file.filename, file.mimetype);
      return url;
    }

    if (dataUrl && dataUrl.startsWith('data:image/')) {
      const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `camera_${Date.now()}.jpg`;
        const url = await uploadToStorage(buffer, filename, mimeType);
        return url;
      }
    }
  } catch (err) {
    console.error('[Supabase Storage] Failed to upload photo, falling back:', err.message);
  }
  return null;
}

/**
 * Upsert complaint into Supabase PostgreSQL table 'complaints'
 */
async function syncComplaintToSupabase(complaint) {
  try {
    if (!complaint || !complaint.complaintId) return;

    const payload = {
      complaint_id: complaint.complaintId,
      citizen_name: complaint.citizenName || 'Citizen',
      mobile: complaint.mobile,
      description: complaint.description,
      language: complaint.language || 'en',
      category: complaint.category,
      priority: complaint.priority || 'Moderate',
      photo_url: complaint.photoUrl || '',
      latitude: complaint.location?.latitude || 0,
      longitude: complaint.location?.longitude || 0,
      exact_address: complaint.location?.exactAddress || '',
      village: complaint.location?.village || '',
      mandal: complaint.location?.mandal || '',
      district: complaint.location?.district || '',
      status: complaint.status || 'SUBMITTED',
      assigned_officer_code: complaint.assignedOfficerCode || '',
      assigned_officer_name: complaint.assignedOfficerName || '',
      assigned_at: complaint.assignedAt || null,
      started_at: complaint.startedAt || null,
      completed_at: complaint.completedAt || null,
      completion_photo_url: complaint.completionPhotoUrl || '',
      resolution_note: complaint.resolutionNote || '',
      rejection_reason: complaint.rejectionReason || '',
      timeline: complaint.timeline || []
    };

    const { error } = await supabase
      .from('complaints')
      .upsert(payload, { onConflict: 'complaint_id' });

    if (error) {
      console.warn('[Supabase Sync] Warning syncing complaint:', error.message);
    } else {
      console.log(`[Supabase Sync] Synced complaint ${complaint.complaintId} to Supabase DB.`);
    }
  } catch (err) {
    console.warn('[Supabase Sync] Exception syncing complaint:', err.message);
  }
}

module.exports = {
  uploadPhotoToSupabase,
  syncComplaintToSupabase
};
