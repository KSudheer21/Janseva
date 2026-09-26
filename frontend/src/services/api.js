/**
 * Centralized API Client for JanSeva
 */

// Dynamically determine API base URL so the app works on other devices (phones, tablets, other PCs)
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When accessed via browser, relative '/api' works seamlessly through
  // Vite's proxy on both localhost AND external network devices (e.g. http://172.172.1.247:5173/api)
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

async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: 'Server responded with non-JSON content.' };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Base URL helper
  getFileUrl(relativeOrAbsolute) {
    if (!relativeOrAbsolute) return '';
    if (relativeOrAbsolute.startsWith('data:') || relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
      return relativeOrAbsolute;
    }
    const backendRoot = API_BASE.replace(/\/api\/?$/, '');
    const cleanPath = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
    return `${backendRoot}${cleanPath}`;
  },

  // Auth
  async requestCitizenOtp(mobile) {
    const res = await fetch(`${API_BASE}/auth/citizen/request-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mobile })
    });
    return handleResponse(res);
  },

  async verifyCitizenOtp(mobile, otp, name, language) {
    const res = await fetch(`${API_BASE}/auth/citizen/verify-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mobile, otp, name, language })
    });
    return handleResponse(res);
  },

  async officerLogin(officerId, password) {
    const res = await fetch(`${API_BASE}/auth/officer/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ officerId, password })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateCitizenProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/citizen/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  // Complaints - Citizen
  async suggestPriority(category, description) {
    const res = await fetch(`${API_BASE}/complaints/suggest-priority`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ category, description })
    });
    return handleResponse(res);
  },

  async submitComplaint(formData) {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async getMyComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints/my${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getMyComplaintById(id) {
    const res = await fetch(`${API_BASE}/complaints/my/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Complaints - Officer
  async getOfficerDashboard() {
    const res = await fetch(`${API_BASE}/complaints/officer/dashboard`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getOfficerComplaintList(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/complaints/officer/list${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getOfficerComplaintById(id) {
    const res = await fetch(`${API_BASE}/complaints/officer/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async assignComplaint(id) {
    const res = await fetch(`${API_BASE}/complaints/officer/${id}/assign`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateComplaintStatus(id, { status, note, rejectionReason }) {
    const res = await fetch(`${API_BASE}/complaints/officer/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note, rejectionReason })
    });
    return handleResponse(res);
  },

  async completeComplaint(id, formData) {
    const res = await fetch(`${API_BASE}/complaints/officer/${id}/complete`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async getOfficerReports() {
    const res = await fetch(`${API_BASE}/complaints/officer/reports`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
