import createApiClient from './axios';

// API Configuration
interface ApiConfig {
  useMockData: boolean;
  apiUrl: string;
  realApiUrl: string;
}

// Get configuration from environment variables with fallbacks
const config: ApiConfig = {
  // Temporarily force mock data to true for sequential numbering feature while backend auth is resolved
  useMockData: true, // process.env.REACT_APP_USE_MOCK_DATA === 'true',
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  realApiUrl: process.env.REACT_APP_REAL_API_URL || 'http://localhost:3000/api'
};

// For development, allow overriding mock mode via localStorage
// This lets developers switch between mock and real API without affecting Vercel deployments
// Temporarily commented out to ensure mock data is always used
/*
const localStorageMockOverride = localStorage.getItem('useMockData');
if (localStorageMockOverride !== null) {
  config.useMockData = localStorageMockOverride === 'true';
}
*/

// Force mock data to true and store in localStorage
localStorage.setItem('useMockData', 'true');

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
const api = createApiClient(apiConfig.getApiUrl());

export default api;