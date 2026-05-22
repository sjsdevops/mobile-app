/** teacher and coordinator both hit /sigin/employee; student hits /sigin/student */
export type UserRole = 'admin' | 'principal' | 'teacher' | 'coordinator' | 'student';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RolePermission = {
  role_permission_id: string;
  role_id: string;
  permission_id: string;
  permission_key: string;
  module: string;
  category: string;
  label: string;
  is_enabled: boolean;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    employee_id?: string;
    student_id?: string;
    first_name: string;
    last_name?: string;
    email?: string;
    role: {
      role_id: string;
      role_name: string;
    } | string;
    [key: string]: unknown;
  };
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  roleId: string;
};
