/** teacher and coordinator both hit /sigin/employee; student hits /sigin/student */
export type UserRole = 'teacher' | 'coordinator' | 'student';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user_id: string | number;
  role: UserRole;
  name?: string;
};
