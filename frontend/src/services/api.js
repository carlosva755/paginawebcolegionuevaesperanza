import axios from 'axios';

// Base URLs for the two decoupled microservices
const ALERTAS_BASE_URL = import.meta.env.VITE_ALERTAS_API_URL || 'http://localhost:5001/api/v1';
const ACOMPANAMIENTO_BASE_URL = import.meta.env.VITE_ACOMPANAMIENTO_API_URL || 'http://localhost:5002/api/v1';

// Axios client instance for Microservice 1 (Alertas - C#)
export const alertasApi = axios.create({
  baseURL: ALERTAS_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios client instance for Microservice 2 (Acompañamiento - Node.js)
export const acompanamientoApi = axios.create({
  baseURL: ACOMPANAMIENTO_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Shared interceptor injecting JWT bearer tokens into outbound requests
const attachAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('ied_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Expired or invalid token: cleanup local credentials
        console.warn('Session expired or unauthorized request.');
      }
      return Promise.reject(error);
    }
  );
};

attachAuthInterceptor(alertasApi);
attachAuthInterceptor(acompanamientoApi);

export default { alertasApi, acompanamientoApi };
