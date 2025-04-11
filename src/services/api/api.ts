import axios from 'axios';

// Use .env variable for API URL or fallback to localhost:3001
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios instance
const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle expired tokens, server errors, etc.
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        // Redirect to login if needed
        // window.location.href = '/login';
      }
      
      // Custom error message
      const errorMessage = error.response.data?.message || 'An error occurred';
      error.message = errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      error.message = 'No response from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;