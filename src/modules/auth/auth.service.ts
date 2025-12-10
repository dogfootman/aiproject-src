/**
 * Auth Service
 * 인증 관련 비즈니스 로직
 */

import { isPoc } from '@/core/config';
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  LoginAttempt,
  PasswordResetRequest,
} from './auth.types';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// In-memory store for PoC (will be replaced with DB in Dev/Prod)
const loginAttempts: Map<string, LoginAttempt[]> = new Map();

export class AuthService {
  /**
   * 로그인 처리
   * FR-002: 아이디/비밀번호 기반 로그인
   * FR-005: 로그인 실패 시도 기록 및 계정 잠금
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Check if account is locked
    if (this.isAccountLocked(email)) {
      throw new Error('계정이 잠겨 있습니다. 30분 후에 다시 시도해주세요.');
    }

    // PoC mode: bypass authentication
    if (isPoc()) {
      const mockUser = await this.getMockUser(email);
      if (mockUser) {
        this.clearLoginAttempts(email);
        return this.createLoginResponse(mockUser);
      }
    }

    // Validate credentials (실제 구현에서는 DB 조회 및 비밀번호 해시 비교)
    const user = await this.validateCredentials(email, password);

    if (!user) {
      await this.recordLoginAttempt(email, false);
      const remainingAttempts = MAX_LOGIN_ATTEMPTS - this.getRecentAttemptCount(email);

      if (remainingAttempts <= 0) {
        throw new Error('로그인 시도 횟수를 초과했습니다. 계정이 잠겼습니다.');
      }

      throw new Error(`로그인에 실패했습니다. ${remainingAttempts}회 시도 가능합니다.`);
    }

    this.clearLoginAttempts(email);
    return this.createLoginResponse(user);
  }

  /**
   * 로그아웃 처리
   */
  async logout(userId: string): Promise<void> {
    // 세션 무효화 로직 (실제 구현에서는 토큰 블랙리스트 등)
    console.log(`User ${userId} logged out`);
  }

  /**
   * 비밀번호 재설정 요청
   * FR-003: 비밀번호 재설정 요청
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const { email } = request;
    // 실제 구현에서는 이메일 발송 로직
    console.log(`Password reset email sent to ${email}`);
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    // 실제 구현에서는 리프레시 토큰 검증 및 새 토큰 발급
    throw new Error('Not implemented');
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(accessToken: string): Promise<AuthUser | null> {
    // 실제 구현에서는 토큰에서 사용자 ID 추출 후 조회
    if (isPoc()) {
      return this.getMockUser('admin@example.com');
    }
    return null;
  }

  // Private methods

  private async validateCredentials(email: string, password: string): Promise<AuthUser | null> {
    // PoC/Dev에서는 간단한 검증
    if (isPoc()) {
      return this.getMockUser(email);
    }
    // 실제 구현에서는 DB 조회 및 bcrypt 비교
    return null;
  }

  private async getMockUser(email: string): Promise<AuthUser | null> {
    const mockUsers: Record<string, AuthUser> = {
      'admin@example.com': {
        id: 'user-001',
        email: 'admin@example.com',
        name: '관리자',
        role: {
          id: 'role-001',
          name: 'admin',
          permissions: [
            { id: 'perm-001', code: 'all', name: '전체 권한', module: '*' }
          ],
          description: '시스템 관리자'
        },
        status: 'active',
        lastLoginAt: new Date()
      },
      'user@example.com': {
        id: 'user-002',
        email: 'user@example.com',
        name: '일반 사용자',
        role: {
          id: 'role-002',
          name: 'user',
          permissions: [
            { id: 'perm-002', code: 'read', name: '읽기 권한', module: '*' }
          ],
          description: '일반 사용자'
        },
        status: 'active',
        lastLoginAt: new Date()
      }
    };

    return mockUsers[email] || null;
  }

  private createLoginResponse(user: AuthUser): LoginResponse {
    // 실제 구현에서는 JWT 토큰 생성
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  private isAccountLocked(email: string): boolean {
    const attempts = loginAttempts.get(email) || [];
    const recentAttempts = this.getRecentAttempts(attempts);
    const failedAttempts = recentAttempts.filter(a => !a.success);
    return failedAttempts.length >= MAX_LOGIN_ATTEMPTS;
  }

  private getRecentAttemptCount(email: string): number {
    const attempts = loginAttempts.get(email) || [];
    return this.getRecentAttempts(attempts).filter(a => !a.success).length;
  }

  private getRecentAttempts(attempts: LoginAttempt[]): LoginAttempt[] {
    const cutoff = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);
    return attempts.filter(a => a.attemptedAt > cutoff);
  }

  private async recordLoginAttempt(email: string, success: boolean): Promise<void> {
    const attempts = loginAttempts.get(email) || [];
    attempts.push({
      email,
      ip: '0.0.0.0', // 실제 구현에서는 실제 IP
      userAgent: 'unknown',
      success,
      attemptedAt: new Date()
    });
    loginAttempts.set(email, attempts);
  }

  private clearLoginAttempts(email: string): void {
    loginAttempts.delete(email);
  }
}

export const authService = new AuthService();
