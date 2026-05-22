import axios from 'axios';

const BASE_URL = 'http://leq3n23ynou6mjfaxg0v5tw9.82.29.165.177.sslip.io';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request & Response Logger ────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    console.log(
      `📤 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data ? `\n   Body: ${JSON.stringify(config.data)}` : '',
    );
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `📥 [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      `\n   Data: ${JSON.stringify(response.data).slice(0, 500)}`,
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ [API Error] ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        `\n   Data: ${JSON.stringify(error.response.data)}`,
      );
    } else {
      console.error('❌ [API Network Error]', error.message);
    }
    return Promise.reject(error);
  },
);

/** Attach/remove bearer token after login */
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

