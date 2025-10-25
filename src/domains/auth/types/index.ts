// 认证相关类型定义

export interface User {
  id: string;
  account: string;
  avatar?: string;
  permissions: string[];
  roles: string[];
}

export interface LoginCredentials {
  account: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  isLoading: boolean;
  error: string | null;
}

export interface PasswordChangeData {
  password: string;
  newPassword: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  getPermissions(): Promise<string[]>;
  changePassword(data: PasswordChangeData): Promise<void>;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'UNKNOWN_ERROR';