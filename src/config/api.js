// Use environment variable if available, otherwise use localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// API endpoints
export const ENDPOINTS = {
  GRANTS: '/admin/grants',
  SEARCH_GRANTS: '/admin/search-grants',
  UPLOAD_GRANT: '/admin/upload-grant',
  ANALYZE_GRANT: '/analyze-grant',
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 