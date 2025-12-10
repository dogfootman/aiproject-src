import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '이메일과 비밀번호를 입력해주세요.' } },
        { status: 400 }
      );
    }

    const result = await authService.login({ email, password });

    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        expiresIn: result.expiresIn
      }
    });

    // Set HTTP-only cookies for tokens
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.expiresIn
    });

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'LOGIN_FAILED', message } },
      { status: 401 }
    );
  }
}
