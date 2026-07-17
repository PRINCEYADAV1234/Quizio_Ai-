import axios from 'axios';
import { useAuthStore } from './authStore';
import { reportApiAvailable, reportApiUnavailable } from './apiStatus';
import { getBackendUrl } from './backendUrl';

const BACKEND_URL = getBackendUrl();

const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    reportApiAvailable();
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isServerDown = !error.response || error.code === 'ECONNABORTED' || status >= 500;

    if (isServerDown) {
      reportApiUnavailable('API NOT WORKING. Backend server is not responding. Please check Railway backend URL and deployment.');
    }

    return Promise.reject(error);
  }
);

export default api;
