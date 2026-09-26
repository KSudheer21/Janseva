import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eoqresrefkxmbrzzrjea.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcXJlc3JlZmt4bWJyenpyamVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDA5ODcsImV4cCI6MjEwNjAxNjk4N30.W-JUcvE9JjZVmZ33QcM8toTCMciE0FY1AZgZj2_5gaI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Normalizes a Supabase snake_case complaint row to camelCase format expected by React UI
 */
export function normalizeComplaint(item) {
  if (!item) return null;
  return {
    _id: item.id,
    id: item.id,
    complaintId: item.complaint_id,
    citizenName: item.citizen_name || 'Citizen',
    mobile: item.mobile,
    description: item.description,
    language: item.language || 'en',
    category: item.category,
    priority: item.priority || 'Moderate',
    photoUrl: item.photo_url || '',
    completionPhotoUrl: item.completion_photo_url || '',
    resolutionNote: item.resolution_note || '',
    rejectionReason: item.rejection_reason || '',
    location: {
      latitude: item.latitude,
      longitude: item.longitude,
      exactAddress: item.exact_address || '',
      village: item.village || '',
      mandal: item.mandal || '',
      district: item.district || ''
    },
    status: item.status || 'SUBMITTED',
    assignedOfficerCode: item.assigned_officer_code || '',
    assignedOfficerName: item.assigned_officer_name || '',
    assignedAt: item.assigned_at,
    startedAt: item.started_at,
    completedAt: item.completed_at,
    timeline: item.timeline || [],
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

/**
 * Uploads a file (or base64 string) directly to Supabase Cloud Storage
 */
export async function uploadImageToSupabase(fileOrDataUrl, prefix = 'photo') {
  if (!fileOrDataUrl) return '';

  try {
    const bucket = 'complaint-photos';

    // 1. If it's a File or Blob
    if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      const ext = fileOrDataUrl.name ? fileOrDataUrl.name.split('.').pop() : 'jpg';
      const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `complaints/${filename}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileOrDataUrl, {
          contentType: fileOrDataUrl.type || 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.warn('[Supabase Storage] File upload error:', error.message);
        return '';
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return urlData.publicUrl;
    }

    // 2. If it's a base64 Data URL
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
      const matches = fileOrDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const ext = mimeType.split('/')[1] || 'jpg';
        const filename = `${prefix}_camera_${Date.now()}.${ext}`;
        const filePath = `complaints/${filename}`;

        const { error } = await supabase.storage.from(bucket).upload(filePath, blob, {
          contentType: mimeType,
          upsert: true
        });

        if (error) {
          console.warn('[Supabase Storage] Base64 upload error:', error.message);
          return fileOrDataUrl; // Return dataUrl as fallback
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return urlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('[Supabase Storage] Upload exception:', err);
  }

  return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
}
