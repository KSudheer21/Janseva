/**
 * Centralized API Client for JanSeva
 * Supports dual-mode: Express Backend API with seamless direct Supabase Cloud fallback
 */
import { supabase, normalizeComplaint, uploadImageToSupabase } from './supabaseService';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

const API_BASE = getApiBase();

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('janseva_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Helper to get current user from localStorage
function getCurrentUser() {
  try {
    const saved = localStorage.getItem('janseva_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Check if we should fallback directly to Supabase
// (when running on cloud host like Vercel with no backend server configured)
function isCloudFallback() {
  return !import.meta.env.VITE_API_URL && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
}

export const api = {
  getFileUrl(relativeOrAbsolute) {
    if (!relativeOrAbsolute) return '';
    if (
      relativeOrAbsolute.startsWith('data:') ||
      relativeOrAbsolute.startsWith('http://') ||
      relativeOrAbsolute.startsWith('https://')
    ) {
      return relativeOrAbsolute;
    }
    const backendRoot = API_BASE.replace(/\/api\/?$/, '');
    const cleanPath = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
    return `${backendRoot}${cleanPath}`;
  },

  // 1. Request OTP
  async requestCitizenOtp(mobile) {
    if (!isCloudFallback()) {
      try {
        const res = await fetch(`${API_BASE}/auth/citizen/request-otp`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ mobile })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await res.json();
        }
      } catch (e) {}
    }

    // Direct Supabase / Cloud Fallback
    return {
      success: true,
      demoOtp: '123456',
      message: 'Demo OTP generated: 123456'
    };
  },

  // 2. Verify OTP
  async verifyCitizenOtp(mobile, otp, name, language) {
    if (!isCloudFallback()) {
      try {
        const res = await fetch(`${API_BASE}/auth/citizen/verify-otp`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ mobile, otp, name, language })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Please enter 123456 in demo mode.');
    }

    const { data: citizen, error } = await supabase
      .from('citizens')
      .upsert(
        {
          name: name || 'Citizen',
          mobile: mobile.trim(),
          language: language || 'en'
        },
        { onConflict: 'mobile' }
      )
      .select()
      .single();

    const userData = {
      id: citizen?.id || `cit_${Date.now()}`,
      name: citizen?.name || name || 'Citizen',
      mobile: mobile.trim(),
      language: citizen?.language || language || 'en',
      role: 'citizen'
    };

    return {
      success: true,
      token: `supabase_token_${Date.now()}`,
      user: userData
    };
  },

  // 3. Officer Login
  async officerLogin(officerId, password) {
    if (!isCloudFallback()) {
      try {
        const res = await fetch(`${API_BASE}/auth/officer/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ officerId, password })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    const cleanId = (officerId || '').trim().toUpperCase();
    const { data: officer, error } = await supabase
      .from('officers')
      .select('*')
      .eq('officer_id', cleanId)
      .single();

    if (error || !officer) {
      // If table doesn't have it yet, allow default demo OFF001
      if (cleanId === 'OFF001' && password === '1234') {
        return {
          success: true,
          token: `officer_token_${cleanId}`,
          user: {
            id: 'demo_off001',
            officerId: 'OFF001',
            name: 'Sri Rajesh Sharma',
            department: 'Municipal Corporation Grievance Redressal',
            designation: 'Senior Municipal Nodal Officer',
            role: 'officer'
          }
        };
      }
      throw new Error('Invalid Officer ID or Password.');
    }

    if (password !== '1234') {
      throw new Error('Invalid password. Default demo password is 1234.');
    }

    return {
      success: true,
      token: `officer_token_${officer.officer_id}`,
      user: {
        id: officer.id,
        officerId: officer.officer_id,
        name: officer.name,
        department: officer.department,
        designation: officer.designation,
        phone: officer.phone,
        email: officer.email,
        role: 'officer'
      }
    };
  },

  // 4. Get Current Profile
  async getMe() {
    const user = getCurrentUser();
    return { success: true, user };
  },

  // 5. Update Citizen Profile
  async updateCitizenProfile(profileData) {
    const user = getCurrentUser();
    if (user && user.mobile) {
      await supabase
        .from('citizens')
        .update(profileData)
        .eq('mobile', user.mobile);
    }
    return { success: true, user: { ...user, ...profileData } };
  },

  // 6. Suggest Priority Heuristic
  async suggestPriority(category, description) {
    const text = `${category} ${description}`.toLowerCase();
    let priority = 'Moderate';
    let reason = 'Standard grievance queued for verification.';

    if (
      text.includes('fire') ||
      text.includes('danger') ||
      text.includes('urgent') ||
      text.includes('accident') ||
      text.includes('burst') ||
      text.includes('open drain') ||
      text.includes('high') ||
      text.includes('deep pothole') ||
      text.includes('spark')
    ) {
      priority = 'High';
      reason = 'Severe safety hazard or critical service interruption detected.';
    } else if (
      text.includes('dirty') ||
      text.includes('light') ||
      text.includes('garbage') ||
      text.includes('smell')
    ) {
      priority = 'Moderate';
      reason = 'Civic maintenance issue impacting daily neighborhood routine.';
    } else {
      priority = 'Low';
      reason = 'General civic feedback or minor maintenance request.';
    }

    return { success: true, priority, reason };
  },

  // 7. Submit Complaint
  async submitComplaint(formData) {
    if (!isCloudFallback()) {
      try {
        const res = await fetch(`${API_BASE}/complaints`, {
          method: 'POST',
          headers: getHeaders(true),
          body: formData
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    const user = getCurrentUser();
    const photoFile = formData.get('photo');
    const photoDataUrl = formData.get('photoDataUrl');
    let photoUrl = '';

    if (photoFile || photoDataUrl) {
      photoUrl = await uploadImageToSupabase(photoFile || photoDataUrl, 'complaint');
    }

    const complaintId = `JS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const category = formData.get('category') || 'Other';
    const description = formData.get('description') || '';
    const priority = formData.get('priority') || 'Moderate';
    const language = formData.get('language') || user?.language || 'en';
    const latitude = parseFloat(formData.get('latitude')) || 17.385;
    const longitude = parseFloat(formData.get('longitude')) || 78.486;
    const village = formData.get('village') || 'Ward 12';
    const mandal = formData.get('mandal') || 'Central';
    const district = formData.get('district') || 'City';
    const exactAddress = formData.get('exactAddress') || `${village}, ${mandal}`;

    const newRecord = {
      complaint_id: complaintId,
      citizen_name: user?.name || 'Citizen',
      mobile: user?.mobile || '9999999999',
      description,
      language,
      category,
      priority,
      photo_url: photoUrl,
      latitude,
      longitude,
      exact_address: exactAddress,
      village,
      mandal,
      district,
      status: 'SUBMITTED',
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: new Date().toISOString(),
          description: `Grievance registered with GPS coordinates (${village}, ${mandal}).`,
          performedBy: `Citizen (${user?.name || 'Citizen'})`
        }
      ]
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save complaint to Supabase: ${error.message}`);
    }

    return {
      success: true,
      complaintId,
      complaint: normalizeComplaint(data)
    };
  },

  // 8. Get Citizen Complaints
  async getMyComplaints(params = {}) {
    if (!isCloudFallback()) {
      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/complaints/my${query ? `?${query}` : ''}`, {
          method: 'GET',
          headers: getHeaders()
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    const user = getCurrentUser();
    let q = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (user && user.mobile) {
      q = q.eq('mobile', user.mobile);
    }

    if (params.status && params.status !== 'ALL') {
      q = q.eq('status', params.status);
    }
    if (params.category && params.category !== 'ALL') {
      q = q.eq('category', params.category);
    }

    const { data, error } = await q;
    const complaints = (data || []).map(normalizeComplaint);

    return {
      success: true,
      count: complaints.length,
      complaints
    };
  },

  // 9. Get Single Complaint by ID
  async getMyComplaintById(id) {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .or(`complaint_id.eq.${id},id.eq.${id}`)
      .single();

    return {
      success: true,
      complaint: normalizeComplaint(data)
    };
  },

  // 10. Officer Dashboard Stats
  async getOfficerDashboard() {
    if (!isCloudFallback()) {
      try {
        const res = await fetch(`${API_BASE}/complaints/officer/dashboard`, {
          method: 'GET',
          headers: getHeaders()
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    const { data: allComplaints } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    const complaints = (allComplaints || []).map(normalizeComplaint);

    const stats = {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'SUBMITTED').length,
      inProgress: complaints.filter((c) => c.status === 'IN PROGRESS').length,
      completed: complaints.filter((c) => c.status === 'COMPLETED').length,
      rejected: complaints.filter((c) => c.status === 'REJECTED').length,
      highPriority: complaints.filter((c) => c.priority === 'High').length
    };

    return {
      success: true,
      stats,
      recentComplaints: complaints.slice(0, 10),
      officer: getCurrentUser()
    };
  },

  // 11. Officer Complaint List
  async getOfficerComplaintList(params = {}) {
    if (!isCloudFallback()) {
      try {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/complaints/officer/list${query ? `?${query}` : ''}`, {
          method: 'GET',
          headers: getHeaders()
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) return data;
        }
      } catch (e) {}
    }

    // Direct Supabase Fallback
    let q = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.status && params.status !== 'ALL') {
      q = q.eq('status', params.status);
    }
    if (params.category && params.category !== 'ALL') {
      q = q.eq('category', params.category);
    }
    if (params.priority && params.priority !== 'ALL') {
      q = q.eq('priority', params.priority);
    }

    const { data } = await q;
    let list = (data || []).map(normalizeComplaint);

    if (params.search) {
      const term = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.citizenName.toLowerCase().includes(term)
      );
    }

    return {
      success: true,
      count: list.length,
      complaints: list
    };
  },

  // 12. Officer Get Complaint By ID
  async getOfficerComplaintById(id) {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .or(`complaint_id.eq.${id},id.eq.${id}`)
      .single();

    return {
      success: true,
      complaint: normalizeComplaint(data)
    };
  },

  // 13. Assign Complaint
  async assignComplaint(id) {
    const user = getCurrentUser();
    const officerName = user?.name || 'Sri Rajesh Sharma';
    const officerCode = user?.officerId || 'OFF001';

    const { data: existing } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', id)
      .single();

    const timeline = existing?.timeline || [];
    timeline.push({
      status: 'ASSIGNED',
      title: 'Assigned to Municipal Officer',
      timestamp: new Date().toISOString(),
      description: `Assigned to ${officerName} (${officerCode}) for inspection.`,
      performedBy: officerName
    });

    const { data, error } = await supabase
      .from('complaints')
      .update({
        status: 'ASSIGNED',
        assigned_officer_code: officerCode,
        assigned_officer_name: officerName,
        assigned_at: new Date().toISOString(),
        timeline
      })
      .eq('complaint_id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, complaint: normalizeComplaint(data) };
  },

  // 14. Update Status (In Progress / Rejected)
  async updateComplaintStatus(id, { status, note, rejectionReason }) {
    const user = getCurrentUser();
    const officerName = user?.name || 'Officer';

    const { data: existing } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', id)
      .single();

    const timeline = existing?.timeline || [];
    timeline.push({
      status,
      title: status === 'IN PROGRESS' ? 'Work In Progress' : 'Complaint Rejected',
      timestamp: new Date().toISOString(),
      description: note || rejectionReason || `Status updated to ${status}.`,
      performedBy: officerName
    });

    const updatePayload = {
      status,
      timeline
    };

    if (status === 'IN PROGRESS') {
      updatePayload.started_at = new Date().toISOString();
    } else if (status === 'REJECTED') {
      updatePayload.rejection_reason = rejectionReason || note || '';
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('complaint_id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, complaint: normalizeComplaint(data) };
  },

  // 15. Complete Complaint with Proof
  async completeComplaint(id, formData) {
    const user = getCurrentUser();
    const officerName = user?.name || 'Officer';
    const resolutionNote = formData.get('resolutionNote') || 'Issue resolved and verified.';
    const photoFile = formData.get('completionPhoto');
    const photoDataUrl = formData.get('completionPhotoDataUrl');

    let completionPhotoUrl = '';
    if (photoFile || photoDataUrl) {
      completionPhotoUrl = await uploadImageToSupabase(photoFile || photoDataUrl, 'resolution');
    }

    const { data: existing } = await supabase
      .from('complaints')
      .select('*')
      .eq('complaint_id', id)
      .single();

    const timeline = existing?.timeline || [];
    timeline.push({
      status: 'COMPLETED',
      title: 'Problem Solved & Completed',
      timestamp: new Date().toISOString(),
      description: resolutionNote,
      performedBy: officerName
    });

    const { data, error } = await supabase
      .from('complaints')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        completion_photo_url: completionPhotoUrl,
        resolution_note: resolutionNote,
        timeline
      })
      .eq('complaint_id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, complaint: normalizeComplaint(data) };
  },

  // 16. Officer Reports
  async getOfficerReports() {
    const { data: allComplaints } = await supabase.from('complaints').select('*');
    const complaints = (allComplaints || []).map(normalizeComplaint);

    const categoryMap = {};
    complaints.forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });

    return {
      success: true,
      total: complaints.length,
      resolved: complaints.filter((c) => c.status === 'COMPLETED').length,
      pending: complaints.filter((c) => ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS'].includes(c.status)).length,
      categoryDistribution: Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    };
  },

  // 17. Notifications
  async getNotifications() {
    const user = getCurrentUser();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      success: true,
      notifications: data || [],
      unreadCount: (data || []).filter((n) => !n.read).length
    };
  },

  async markNotificationRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    return { success: true };
  }
};
