import { api, setAuthToken } from './api';
import { saveAuthToken, saveRefreshToken, saveUser, savePermissions, clearAuthData } from './storage';
import type { LoginRequest, LoginResponse, AuthUser, UserRole, RolePermission } from '../types/auth';

function mapLoginResponse(data: LoginResponse): AuthUser {
  const rawUser = data.user;
  let roleName: UserRole = 'student';
  let roleId = '';

  if (rawUser.role && typeof rawUser.role === 'object') {
    roleName = (rawUser.role.role_name || 'student').toLowerCase() as UserRole;
    roleId = rawUser.role.role_id || '';
  } else if (typeof rawUser.role === 'string') {
    roleName = rawUser.role.toLowerCase() as UserRole;
  }

  return {
    id: (rawUser.employee_id || rawUser.student_id || '') as string,
    firstName: rawUser.first_name || '',
    lastName: rawUser.last_name || '',
    email: (rawUser.email || '') as string,
    role: roleName,
    roleId,
  };
}

export async function login(
  role: UserRole,
  credentials: LoginRequest,
): Promise<AuthUser> {
  const endpoint = role === 'student' ? '/sigin/student' : '/sigin/employee';
  const response = await api.post(endpoint, credentials);

  // API wraps response in { status_code, data: { user, access_token, refresh_token } }
  const apiData = response.data?.data ?? response.data;
  const data = apiData as LoginResponse;

  // Set auth token in memory
  if (data.access_token) {
    setAuthToken(data.access_token);
    // Persist token (default 1 hour expiry)
    await saveAuthToken(data.access_token, 3600);
  }
  if (data.refresh_token) {
    await saveRefreshToken(data.refresh_token);
  }

  const user = mapLoginResponse(data);
  // Persist user
  await saveUser(user);

  return user;
}

export async function getRolePermissions(roleId: string): Promise<RolePermission[]> {
  const response = await api.get(`/roles/${roleId}/permissions`);
  // API: { status_code, data: { items: [...] } }
  const apiData = response.data?.data ?? response.data;
  const permissions = apiData?.items ?? [];
  // Persist permissions
  await savePermissions(permissions);
  return permissions;
}

export async function logout(): Promise<void> {
  setAuthToken(null);
  await clearAuthData();
}

export async function exchangeToken(): Promise<LoginResponse> {
  const response = await api.get<LoginResponse>('/users/exchange-token');
  return response.data;
}
