// Use environment variable if available, otherwise use localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API endpoints
export const ENDPOINTS = {
  GRANTS: '/api/grants',
  SEARCH_GRANTS: '/api/search-grants',
  UPLOAD_GRANT: '/api/upload-grant',
  ANALYZE_GRANT: '/api/analyze-grant',
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 