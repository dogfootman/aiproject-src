import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/modules/menu';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/menus/:id - 메뉴 단건 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const menu = await menuService.findById(id);

    if (!menu) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '메뉴를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '메뉴 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// PUT /api/menus/:id - 메뉴 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const menu = await menuService.update(id, body);

    if (!menu) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '메뉴를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '메뉴 수정에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message } },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/:id - 메뉴 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await menuService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '메뉴를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: '메뉴가 삭제되었습니다.' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '메뉴 삭제에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message } },
      { status: 500 }
    );
  }
}
