/**
 * Category Service
 * FR-020 ~ FR-023: 카테고리 관리
 */

import { generateId } from '@/shared/utils';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from './category.types';

// In-memory store for PoC
let categories: Category[] = [
  {
    id: 'cat-001',
    name: '공지사항',
    slug: 'notice',
    level: 0,
    order: 1,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-002',
    name: '기술',
    slug: 'tech',
    level: 0,
    order: 2,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    children: [
      {
        id: 'cat-002-1',
        name: '프론트엔드',
        slug: 'frontend',
        parentId: 'cat-002',
        level: 1,
        order: 1,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'cat-002-2',
        name: '백엔드',
        slug: 'backend',
        parentId: 'cat-002',
        level: 1,
        order: 2,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }
    ]
  },
  {
    id: 'cat-003',
    name: '일반',
    slug: 'general',
    level: 0,
    order: 3,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

export class CategoryService {
  /**
   * 카테고리 목록 조회 (트리 구조)
   */
  async findAll(): Promise<Category[]> {
    return this.buildTree(categories.filter(c => !c.parentId && c.isActive));
  }

  /**
   * 플랫 카테고리 목록 조회
   */
  async findAllFlat(): Promise<Category[]> {
    return this.flattenCategories(categories);
  }

  /**
   * 카테고리 단건 조회
   */
  async findById(id: string): Promise<Category | null> {
    return this.findCategoryById(categories, id);
  }

  /**
   * 카테고리 생성
   * FR-020: 관리자는 카테고리를 생성할 수 있어야 한다
   * FR-021: 계층형 카테고리 구조 지원
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const parent = dto.parentId ? this.findCategoryById(categories, dto.parentId) : null;
    const level = parent ? parent.level + 1 : 0;

    const category: Category = {
      id: generateId(),
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      parentId: dto.parentId,
      level,
      order: dto.order ?? 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(category);
    } else {
      categories.push(category);
    }

    return category;
  }

  /**
   * 카테고리 수정
   * FR-020: 관리자는 카테고리를 수정할 수 있어야 한다
   * FR-022: 표시 순서 변경
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category | null> {
    const category = this.findCategoryById(categories, id);
    if (!category) return null;

    Object.assign(category, {
      ...dto,
      updatedAt: new Date()
    });

    return category;
  }

  /**
   * 카테고리 삭제
   * FR-020: 관리자는 카테고리를 삭제할 수 있어야 한다
   */
  async delete(id: string): Promise<boolean> {
    const category = this.findCategoryById(categories, id);
    if (!category) return false;

    // Soft delete with children
    category.isActive = false;
    if (category.children) {
      category.children.forEach(c => { c.isActive = false; });
    }

    return true;
  }

  // Private methods

  private buildTree(items: Category[]): Category[] {
    return items
      .filter(i => i.isActive)
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: item.children ? this.buildTree(item.children) : undefined
      }));
  }

  private findCategoryById(items: Category[], id: string): Category | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findCategoryById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private flattenCategories(items: Category[]): Category[] {
    const result: Category[] = [];
    for (const item of items) {
      result.push(item);
      if (item.children) {
        result.push(...this.flattenCategories(item.children));
      }
    }
    return result;
  }
}

export const categoryService = new CategoryService();
