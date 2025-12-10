import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
      // Extract user ID from token and logout
      // In real implementation, decode JWT and get user ID
      await authService.logout('user-id');
    }

    const response = NextResponse.json({
      success: true,
      data: { message: '로그아웃되었습니다.' }
    });

    // Clear cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그아웃에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'LOGOUT_FAILED', message } },
      { status: 500 }
    );
  }
}
