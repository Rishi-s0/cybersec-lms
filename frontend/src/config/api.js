// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  return response;
};

export default API_URL;
