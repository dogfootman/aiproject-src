export interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: BoardType;
  config: BoardConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BoardType = 'general' | 'notice' | 'qna' | 'gallery' | 'faq';

export interface BoardConfig {
  allowComments: boolean;
  allowAttachments: boolean;
  maxAttachmentSize: number; // bytes
  allowedFileTypes: string[];
  requireApproval: boolean;
  postsPerPage: number;
  permissions: BoardPermissions;
}

export interface BoardPermissions {
  read: string[];
  write: string[];
  delete: string[];
  admin: string[];
}

export interface Post {
  id: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  category?: string;
  tags?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  attachments?: Attachment[];
  isPinned: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBoardDto {
  name: string;
  slug: string;
  description?: string;
  type: BoardType;
  config?: Partial<BoardConfig>;
}

export interface CreatePostDto {
  boardId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  attachments?: string[];
}
