import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/modules/board';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/:id - 게시글 단건 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const post = await boardService.findPostById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시글 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// PUT /api/posts/:id - 게시글 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // In real impl, get user from session/token
    const userId = 'user-001';

    const post = await boardService.updatePost(id, body, userId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시글 수정에 실패했습니다.';
    const status = message.includes('권한') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message } },
      { status }
    );
  }
}

// DELETE /api/posts/:id - 게시글 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // In real impl, get user from session/token
    const userId = 'user-001';

    const deleted = await boardService.deletePost(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: '게시글이 삭제되었습니다.' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
    const status = message.includes('권한') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message } },
      { status }
    );
  }
}
