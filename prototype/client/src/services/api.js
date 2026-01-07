const API_BASE = '/api';

// Get auth token
const getToken = () => localStorage.getItem('token');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  console.log(`🌎 [API] Request to ${endpoint}`);
  console.log('    Method:', options.method || 'GET');
  console.log('    Has token:', !!token);
  
  // Log body type for debugging
  if (options.body) {
    if (options.body instanceof FormData) {
      console.log('    Body type: FormData');
      // Log FormData entries if possible
      try {
        for (let [key, value] of options.body.entries()) {
          if (value instanceof File) {
            console.log(`    FormData[${key}]: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`    FormData[${key}]:`, value);
          }
        }
      } catch (e) {
        console.log('    FormData entries: (unable to enumerate)');
      }
    } else {
      console.log('    Body type:', typeof options.body);
      console.log('    Body preview:', options.body.substring ? options.body.substring(0, 100) : options.body);
    }
  }
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' })
    }
  };

  console.log('    Headers:', Object.keys(config.headers).join(', '));
  console.log(`🚀 [API] Sending request...`);
  const startTime = performance.now();
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  const duration = (performance.now() - startTime).toFixed(2);
  console.log(`✅ [API] Response received in ${duration}ms`);
  console.log('    Status:', response.status, response.statusText);
  console.log('    Content-Type:', response.headers.get('content-type'));
  
  const data = await response.json();
  console.log('    Success:', data.success);
  
  if (!data.success) {
    console.error('❌ [API] Request failed:');
    console.error('    Error code:', data.error?.code);
    console.error('    Error message:', data.error?.message);
    console.error('    Full error:', data.error);
    throw new Error(data.error?.message || 'Request failed');
  }
  
  console.log('✅ [API] Request successful');
  if (data.data && typeof data.data === 'object') {
    console.log('    Response data keys:', Object.keys(data.data).join(', '));
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
