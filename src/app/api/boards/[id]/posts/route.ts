import { NextRequest, NextResponse } from 'next/server';
import { boardService } from '@/modules/board';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/boards/:id/posts - 게시글 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: boardId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || undefined;

    const board = await boardService.findBoardById(boardId);
    if (!board) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시판을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    const { posts, total } = await boardService.findPosts(boardId, { page, pageSize, search });

    return NextResponse.json({
      success: true,
      data: posts,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시글 조회에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}

// POST /api/boards/:id/posts - 게시글 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: boardId } = await params;
    const body = await request.json();

    // In real impl, get user from session/token
    const authorId = 'user-001'; // Mock user

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '제목과 내용은 필수입니다.' } },
        { status: 400 }
      );
    }

    const post = await boardService.createPost({
      boardId,
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags
    }, authorId);

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '게시글 작성에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_FAILED', message } },
      { status: 500 }
    );
  }
}
