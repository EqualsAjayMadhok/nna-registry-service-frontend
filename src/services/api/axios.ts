import axios from 'axios';

// Create configurable axios instance for backend API
const createApiClient = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response.status === 401) {
          localStorage.removeItem('accessToken');
          // Could redirect to login if needed
          // window.location.href = '/login';
        }
        
        error.message = error.response.data?.message || 'An error occurred';
      } else if (error.request) {
        console.error('API No Response:', error.request);
        error.message = 'No response from server';
      } else {
        console.error('API Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

export default createApiClient;