import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://leq3n23ynou6mjfaxg0v5tw9.82.29.165.177.sslip.io';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token refresh state ──────────────────────────────────────────────────────
// Ensures only one refresh request runs at a time — other 401s wait for it.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    console.log(
      `📤 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data ? `\n   Body: ${JSON.stringify(config.data).slice(0, 300)}` : '',
    );
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  },
);

// ─── Response interceptor (with automatic token refresh on 401) ───────────────

api.interceptors.response.use(
  (response) => {
    console.log(
      `📥 [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      `\n   Data: ${JSON.stringify(response.data).slice(0, 500)}`,
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      console.error(
        `❌ [API Error] ${error.response.status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        `\n   Data: ${JSON.stringify(error.response.data)}`,
      );
    } else {
      console.error('❌ [API Network Error]', error.message);
    }

    // Only attempt refresh on 401 and if this request hasn't been retried already
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't refresh if the failing request IS the exchange-token call (avoid infinite loop)
    if (originalRequest.url?.includes('/users/exchange-token')) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request until it completes
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // Start the refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 [API] Refreshing access token...');

      const refreshResponse = await axios.get(`${BASE_URL}/users/exchange-token`, {
        headers: { 'refresh-token': refreshToken },
      });

      const data = refreshResponse.data?.data ?? refreshResponse.data;
      const newAccessToken: string = data.access_token;
      const newRefreshToken: string = data.refresh_token;

      // Store new tokens (24h access, 7d refresh)
      const expiresAt = (Date.now() + 24 * 60 * 60 * 1000).toString();
      await AsyncStorage.multiSet([
        ['auth_token', newAccessToken],
        ['refresh_token', newRefreshToken],
        ['token_expires_at', expiresAt],
      ]);

      // Update the default header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      console.log('✅ [API] Token refreshed successfully');

      // Notify all queued requests
      onTokenRefreshed(newAccessToken);

      // Retry the original request with the new token
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      console.error('❌ [API] Token refresh failed — clearing auth data');

      // Clear all auth data — user must log in again
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'current_user',
        'user_permissions',
        'token_expires_at',
      ]);
      delete api.defaults.headers.common['Authorization'];

      // Notify queued subscribers to reject
      refreshSubscribers = [];

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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
