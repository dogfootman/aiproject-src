import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/modules/menu';

// GET /api/menus - 메뉴 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get('flat') === 'true';
    const role = searchParams.get('role');

    let menus;
    if (role) {
      menus = await menuService.findByUserRole(role);
    } else if (flat) {
      menus = await menuService.findAllFlat();
    } else {
      menus = await menuService.findAll();
    }

    return NextResponse.json({
      success: true,
      data: menus
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '메뉴 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// POST /api/menus - 메뉴 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.path) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '메뉴 이름과 경로는 필수입니다.' } },
        { status: 400 }
      );
    }

    const menu = await menuService.create(body);

    return NextResponse.json({
      success: true,
      data: menu
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '메뉴 생성에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_FAILED', message } },
      { status: 500 }
    );
  }
}
