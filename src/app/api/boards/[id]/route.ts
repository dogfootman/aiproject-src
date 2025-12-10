import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/modules/board';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/boards/:id - 게시판 단건 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const board = await boardService.findBoardById(id);

    if (!board) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시판을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: board
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시판 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// PUT /api/boards/:id - 게시판 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const board = await boardService.updateBoard(id, body);

    if (!board) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시판을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: board
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시판 수정에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message } },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/:id - 게시판 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await boardService.deleteBoard(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시판을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: '게시판이 삭제되었습니다.' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시판 삭제에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message } },
      { status: 500 }
    );
  }
}
