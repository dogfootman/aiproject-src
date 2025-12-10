import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '이메일을 입력해주세요.' } },
        { status: 400 }
      );
    }

    await authService.requestPasswordReset({ email });

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      data: { message: '비밀번호 재설정 이메일이 전송되었습니다.' }
    });
  } catch (error) {
    // Log error but return success message
    console.error('Password reset error:', error);
    return NextResponse.json({
      success: true,
      data: { message: '비밀번호 재설정 이메일이 전송되었습니다.' }
    });
  }
}
