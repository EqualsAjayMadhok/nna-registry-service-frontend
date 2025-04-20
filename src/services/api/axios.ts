import axios from 'axios';

export function createApiClient(baseURL: string) {
  // Create axios instance for backend API
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
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Could redirect to login if needed
          // window.location.href = '/login';
        }
        
        // Extract error message from response
        const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
        error.message = message;
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
}