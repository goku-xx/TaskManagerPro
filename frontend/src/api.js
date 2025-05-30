// d:\TaskManagerPro\frontend\src\api.js
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an Axios instance
const API = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// You can still export individual functions if needed, or just the instance
// export const exampleApiCall = async () => { ... }
export default API;