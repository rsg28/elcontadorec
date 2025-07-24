// API Configuration
// 🔧 MANUAL SWITCH: Change this line to switch environments
// Options: 'development' | 'production'
const MANUAL_ENVIRONMENT = 'production'; // 👈 Change this to 'production' to use EC2 backend

const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || MANUAL_ENVIRONMENT;

// Backend server configurations
const BACKEND_SERVERS = {
  development: {
    BASE_URL: '/api',
    BACKEND_URL: 'http://localhost:5000'
  },
  production: {
    BASE_URL: '/api',
    BACKEND_URL: 'https://api.elcontadorec.store'
  },
  // You can add more environments here:
  // staging: {
  //   BASE_URL: 'http://your-staging-server.com/api',
  //   BACKEND_URL: 'http://your-staging-server.com'
  // }
};

export const API_CONFIG = {
  ENVIRONMENT,
  ...BACKEND_SERVERS[ENVIRONMENT],
  
  // Helper method to get current environment info
  getCurrentEnvironment: () => ({
    environment: ENVIRONMENT,
    isProduction: ENVIRONMENT === 'production',
    isDevelopment: ENVIRONMENT === 'development'
  })
};

export const API_BASE_URL = `${API_CONFIG.BACKEND_URL}${API_CONFIG.BASE_URL}`;

// Log current configuration for debugging
console.log(`🔧 API Config - Environment: ${ENVIRONMENT}`, {
  BASE_URL: API_CONFIG.BASE_URL,
  BACKEND_URL: API_CONFIG.BACKEND_URL
}); 