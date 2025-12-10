/**
 * Auth Module Types
 * FR-001 ~ FR-005: 사용자 인증 관리
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
}

export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  success: boolean;
  attemptedAt: Date;
}

// Auth Context for client-side state
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }
  | { type: 'SET_USER'; payload: AuthUser };
