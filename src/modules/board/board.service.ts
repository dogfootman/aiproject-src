/**
 * Board Service
 * FR-011 ~ FR-016: 게시판 관리
 */

import { generateId } from '@/shared/utils';
import type {
  Board,
  Post,
  Comment,
  CreateBoardDto,
  CreatePostDto,
  BoardConfig,
  BoardType,
} from './board.types';

// Default board config
const defaultConfig: BoardConfig = {
  allowComments: true,
  allowAttachments: true,
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
  requireApproval: false,
  postsPerPage: 20,
  permissions: {
    read: ['user', 'admin'],
    write: ['user', 'admin'],
    delete: ['admin'],
    admin: ['admin']
  }
};

// In-memory store for PoC
let boards: Board[] = [
  {
    id: 'board-001',
    name: '공지사항',
    slug: 'notice',
    description: '시스템 공지사항',
    type: 'notice',
    config: { ...defaultConfig, allowComments: false, permissions: { ...defaultConfig.permissions, write: ['admin'] } },
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'board-002',
    name: '자유게시판',
    slug: 'free',
    description: '자유롭게 글을 작성하세요',
    type: 'general',
    config: defaultConfig,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'board-003',
    name: 'Q&A',
    slug: 'qna',
    description: '질문과 답변',
    type: 'qna',
    config: defaultConfig,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

let posts: Post[] = [];
let comments: Comment[] = [];

export class BoardService {
  // ===== Board CRUD =====

  /**
   * 게시판 목록 조회
   */
  async findAllBoards(): Promise<Board[]> {
    return boards.filter(b => b.isActive);
  }

  /**
   * 게시판 단건 조회
   */
  async findBoardById(id: string): Promise<Board | null> {
    return boards.find(b => b.id === id) || null;
  }

  /**
   * 게시판 slug로 조회
   */
  async findBoardBySlug(slug: string): Promise<Board | null> {
    return boards.find(b => b.slug === slug) || null;
  }

  /**
   * 게시판 생성
   * FR-011: 관리자는 다양한 유형의 게시판을 생성할 수 있어야 한다
   */
  async createBoard(dto: CreateBoardDto): Promise<Board> {
    const board: Board = {
      id: generateId(),
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      type: dto.type,
      config: { ...defaultConfig, ...dto.config },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    boards.push(board);
    return board;
  }

  /**
   * 게시판 수정
   */
  async updateBoard(id: string, dto: Partial<CreateBoardDto>): Promise<Board | null> {
    const board = boards.find(b => b.id === id);
    if (!board) return null;

    Object.assign(board, {
      ...dto,
      config: dto.config ? { ...board.config, ...dto.config } : board.config,
      updatedAt: new Date()
    });

    return board;
  }

  /**
   * 게시판 삭제 (soft delete)
   */
  async deleteBoard(id: string): Promise<boolean> {
    const board = boards.find(b => b.id === id);
    if (!board) return false;

    board.isActive = false;
    board.updatedAt = new Date();
    return true;
  }

  // ===== Post CRUD =====

  /**
   * 게시글 목록 조회 (페이지네이션)
   * FR-015: 시스템은 게시글 목록의 페이지네이션을 지원해야 한다
   */
  async findPosts(
    boardId: string,
    options: { page?: number; pageSize?: number; search?: string } = {}
  ): Promise<{ posts: Post[]; total: number }> {
    const { page = 1, pageSize = 20, search } = options;

    let filtered = posts.filter(p => p.boardId === boardId && p.isPublished);

    // FR-014: 검색 기능
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)
      );
    }

    // Sort by pinned first, then by date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const paginatedPosts = filtered.slice(start, start + pageSize);

    return { posts: paginatedPosts, total };
  }

  /**
   * 게시글 단건 조회
   */
  async findPostById(id: string): Promise<Post | null> {
    const post = posts.find(p => p.id === id);
    if (post) {
      post.viewCount++; // Increment view count
    }
    return post || null;
  }

  /**
   * 게시글 작성
   * FR-012: 사용자는 게시글을 작성할 수 있어야 한다
   */
  async createPost(dto: CreatePostDto, authorId: string): Promise<Post> {
    const post: Post = {
      id: generateId(),
      boardId: dto.boardId,
      title: dto.title,
      content: dto.content,
      authorId,
      category: dto.category,
      tags: dto.tags,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isPinned: false,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    posts.push(post);
    return post;
  }

  /**
   * 게시글 수정
   * FR-012: 사용자는 게시글을 수정할 수 있어야 한다
   */
  async updatePost(id: string, dto: Partial<CreatePostDto>, userId: string): Promise<Post | null> {
    const post = posts.find(p => p.id === id);
    if (!post) return null;

    // Check if user is author (in real impl, also check admin role)
    if (post.authorId !== userId) {
      throw new Error('게시글을 수정할 권한이 없습니다.');
    }

    Object.assign(post, {
      ...dto,
      updatedAt: new Date()
    });

    return post;
  }

  /**
   * 게시글 삭제
   * FR-012: 사용자는 게시글을 삭제할 수 있어야 한다
   */
  async deletePost(id: string, userId: string): Promise<boolean> {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return false;

    const post = posts[index];
    // Check permission (in real impl, also check admin role)
    if (post.authorId !== userId) {
      throw new Error('게시글을 삭제할 권한이 없습니다.');
    }

    posts.splice(index, 1);
    // Also delete related comments
    comments = comments.filter(c => c.postId !== id);

    return true;
  }

  // ===== Comment CRUD =====

  /**
   * 댓글 목록 조회
   */
  async findComments(postId: string): Promise<Comment[]> {
    return comments
      .filter(c => c.postId === postId && !c.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * 댓글 작성
   */
  async createComment(postId: string, content: string, authorId: string, parentId?: string): Promise<Comment> {
    const comment: Comment = {
      id: generateId(),
      postId,
      authorId,
      content,
      parentId,
      likeCount: 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    comments.push(comment);

    // Update post comment count
    const post = posts.find(p => p.id === postId);
    if (post) post.commentCount++;

    return comment;
  }

  /**
   * 댓글 삭제 (soft delete)
   */
  async deleteComment(id: string, userId: string): Promise<boolean> {
    const comment = comments.find(c => c.id === id);
    if (!comment) return false;

    if (comment.authorId !== userId) {
      throw new Error('댓글을 삭제할 권한이 없습니다.');
    }

    comment.isDeleted = true;
    comment.content = '삭제된 댓글입니다.';
    comment.updatedAt = new Date();

    // Update post comment count
    const post = posts.find(p => p.id === comment.postId);
    if (post && post.commentCount > 0) post.commentCount--;

    return true;
  }
}

export const boardService = new BoardService();
