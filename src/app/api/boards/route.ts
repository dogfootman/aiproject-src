import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/modules/board';

// GET /api/boards - 게시판 목록 조회
export async function GET() {
  try {
    const boards = await boardService.findAllBoards();

    return NextResponse.json({
      success: true,
      data: boards
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시판 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// POST /api/boards - 게시판 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.slug || !body.type) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '게시판 이름, slug, 유형은 필수입니다.' } },
        { status: 400 }
      );
    }

    const board = await boardService.createBoard(body);

    return NextResponse.json({
      success: true,
      data: board
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시판 생성에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_FAILED', message } },
      { status: 500 }
    );
  }
}
