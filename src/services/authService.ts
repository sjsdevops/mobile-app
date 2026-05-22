import { api, setAuthToken } from './api';
import type { LoginRequest, LoginResponse, UserRole } from '../types/auth';

/** ----------------------------------------------------------------
 *  Set to `true` during local development to skip the real API call.
 *  Any email + password will be accepted.
 * ---------------------------------------------------------------- */
const USE_MOCK_LOGIN = true;

const MOCK_RESPONSE: LoginResponse = {
  token: 'mock-jwt-token-dev',
  user_id: 1,
  role: 'teacher',
  name: 'Dev User',
};

export async function login(
  role: UserRole,
  credentials: LoginRequest,
): Promise<LoginResponse> {
  if (USE_MOCK_LOGIN) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    const mock = { ...MOCK_RESPONSE, role };
    setAuthToken(mock.token);
    return mock;
  }

  // teacher and coordinator are both employees in the backend
  const endpoint = role === 'student' ? '/sigin/student' : '/sigin/employee';
  const response = await api.post<LoginResponse>(endpoint, credentials);
  setAuthToken(response.data.token);
  return response.data;
}

export async function exchangeToken(): Promise<LoginResponse> {
  const response = await api.get<LoginResponse>('/users/exchange-token');
  return response.data;
}

