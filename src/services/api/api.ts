import { createApiClient } from './axios';
import { AxiosInstance } from 'axios';

// API Configuration
interface ApiConfig {
  useMockData: boolean;
  apiUrl: string;
  realApiUrl: string;
}

// Get configuration from environment variables with fallbacks
// IMPORTANT: For production deployments, we always use the real API
const isProduction = process.env.NODE_ENV === 'production';

const config: ApiConfig = {
  // Force mock mode OFF for production
  useMockData: isProduction ? false : process.env.REACT_APP_USE_MOCK_DATA === 'true',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  realApiUrl: process.env.REACT_APP_REAL_API_URL || 'http://localhost:8080/api'
};

// For development-only, allow overriding mock mode via localStorage
// This is disabled in production to ensure consistent behavior
if (!isProduction) {
  const localStorageMockOverride = localStorage.getItem('useMockData');
  if (localStorageMockOverride !== null) {
    config.useMockData = localStorageMockOverride === 'true';
  }
}

// Log current API configuration
console.log(`NNA Registry Service API Configuration:
- Mode: ${config.useMockData ? 'Mock Data' : 'Real API'}
- URL: ${config.useMockData ? config.apiUrl : config.realApiUrl}
`);

// Export configuration for use in other files
export const apiConfig = {
  useMockData: config.useMockData,
  
  // Enable/disable mock data mode - this allows toggling at runtime
  setUseMockData: (useMock: boolean) => {
    config.useMockData = useMock;
    localStorage.setItem('useMockData', useMock.toString());
    console.log(`API Mode changed to: ${useMock ? 'Mock Data' : 'Real API'}`);
  },
  
  // Get current API URL based on mode
  getApiUrl: () => config.useMockData ? config.apiUrl : config.realApiUrl
};

// Create API client with appropriate URL based on mode
const api: AxiosInstance = createApiClient(apiConfig.getApiUrl());

export default api;