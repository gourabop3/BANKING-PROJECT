import axios from 'axios'

// Determine the base URL based on environment
const getBaseURL = () => {
  // Check if we have the environment variable
  if (process.env.NEXT_PUBLIC_BASE_URI) {
    return process.env.NEXT_PUBLIC_BASE_URI;
  }
  
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/v1';
  }
  
  // For production, use the deployed backend
  return 'https://tts-ml-bank.onrender.com/api/v1';
};

const baseURL = getBaseURL();

// eslint-disable-next-line no-console
console.info('[Axios] Base URL:', baseURL);
console.info('[Axios] Environment:', process.env.NODE_ENV);

export const axiosClient = axios.create({ 
  baseURL,
  timeout: 10000, // 10 second timeout
  withCredentials: false, // Set to false to avoid CORS preflight issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log the request for debugging
    console.log('[Axios Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
axiosClient.interceptors.response.use(
  (response) => {
    console.log('[Axios Response Success]', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[Axios Response Error]', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Handle CORS errors specifically
    if (error.message.includes('CORS') || error.message.includes('Network Error')) {
      console.error('[CORS Error] Please check backend CORS configuration');
    }
    
    return Promise.reject(error);
  }
);