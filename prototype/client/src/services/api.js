const API_BASE = '/api';

// Get auth token
const getToken = () => localStorage.getItem('token');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' })
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data.data;
};

// Auth API
export const authApi = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  getMe: () => apiRequest('/auth/me')
};

// Claims API
export const claimsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/claims${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/claims/${id}`),
  
  create: (formData) => apiRequest('/claims', {
    method: 'POST',
    body: formData // FormData for file uploads
  }),
  
  updateStatus: (id, status, note, reviewedBy) => apiRequest(`/claims/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note, reviewedBy })
  }),
  
  getStats: () => apiRequest('/claims/stats/overview')
};

// Policies API
export const policiesApi = {
  getAll: (userId) => apiRequest(`/policies${userId ? `?userId=${userId}` : ''}`),
  
  getById: (id) => apiRequest(`/policies/${id}`),
  
  validate: (policyNumber) => apiRequest('/policies/validate', {
    method: 'POST',
    body: JSON.stringify({ policyNumber })
  }),
  
  ocr: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return apiRequest('/policies/ocr', {
      method: 'POST',
      body: formData
    });
  },
  
  getRequirements: (type) => apiRequest(`/policies/requirements/${type}`)
};

// Chat API
export const chatApi = {
  send: (sessionId, message, userId, context = {}) => apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message, userId, context })
  }),
  
  getHistory: (sessionId) => apiRequest(`/chat/${sessionId}`),
  
  clearSession: (sessionId) => apiRequest(`/chat/${sessionId}`, { method: 'DELETE' }),
  
  getQuickQuestions: () => apiRequest('/chat/help/quick')
};

// TTS API
export const ttsApi = {
  synthesize: async (text, voice = 'en-US-JennyNeural') => {
    const token = getToken();
    const response = await fetch(`${API_BASE}/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({ text, voice })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'TTS failed');
    }

    return response.blob();
  },
  
  getVoices: () => apiRequest('/tts/voices')
};

export default {
  auth: authApi,
  claims: claimsApi,
  policies: policiesApi,
  chat: chatApi,
  tts: ttsApi
};
