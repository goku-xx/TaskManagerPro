// d:\TaskManagerPro\frontend\src\api.js
import axios from 'axios';

// Ensure this matches your backend's actual running port and base API path.
// Your backend .env (playground-1.mongodb.js) suggests PORT=3000.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'; 

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;