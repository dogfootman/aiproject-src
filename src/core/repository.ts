/**
 * Repository Pattern - 단계별 데이터 소스 전환을 위한 추상화 레이어
 *
 * PoC: File-based (JSON)
 * Dev/Prod: Database (PostgreSQL)
 */

export interface Repository<T, CreateDto, UpdateDto> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/**
 * Base class for file-based repositories (PoC stage)
 */
export abstract class FileRepository<T, CreateDto, UpdateDto> implements Repository<T, CreateDto, UpdateDto> {
  protected abstract filePath: string;

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}

/**
 * Base class for database repositories (Dev/Prod stage)
 */
export abstract class DbRepository<T, CreateDto, UpdateDto> implements Repository<T, CreateDto, UpdateDto> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
