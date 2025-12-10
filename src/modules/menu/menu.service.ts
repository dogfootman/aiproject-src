/**
 * Menu Service
 * FR-006 ~ FR-010: 메뉴 관리
 */

import { isPoc } from '@/core/config';
import { generateId } from '@/shared/utils';
import type { Menu, CreateMenuDto, UpdateMenuDto } from './menu.types';

// In-memory store for PoC
let menus: Menu[] = [
  {
    id: 'menu-001',
    name: '대시보드',
    path: '/dashboard',
    icon: 'home',
    order: 1,
    isActive: true,
    permissions: ['user', 'admin'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'menu-002',
    name: '사용자 관리',
    path: '/dashboard/users',
    icon: 'users',
    order: 2,
    isActive: true,
    permissions: ['admin'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'menu-003',
    name: '게시판',
    path: '/dashboard/boards',
    icon: 'file-text',
    order: 3,
    isActive: true,
    permissions: ['user', 'admin'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'menu-004',
    name: '설정',
    path: '/dashboard/settings',
    icon: 'settings',
    parentId: undefined,
    order: 4,
    isActive: true,
    permissions: ['admin'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    children: [
      {
        id: 'menu-004-1',
        name: '메뉴 관리',
        path: '/dashboard/menus',
        icon: 'menu',
        parentId: 'menu-004',
        order: 1,
        isActive: true,
        permissions: ['admin'],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'menu-004-2',
        name: '공통코드',
        path: '/dashboard/codes',
        icon: 'tag',
        parentId: 'menu-004',
        order: 2,
        isActive: true,
        permissions: ['admin'],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }
    ]
  }
];

export class MenuService {
  /**
   * 전체 메뉴 목록 조회 (트리 구조)
   */
  async findAll(): Promise<Menu[]> {
    return this.buildMenuTree(menus.filter(m => !m.parentId));
  }

  /**
   * 플랫 메뉴 목록 조회
   */
  async findAllFlat(): Promise<Menu[]> {
    return [...menus];
  }

  /**
   * 메뉴 단건 조회
   */
  async findById(id: string): Promise<Menu | null> {
    return this.findMenuById(menus, id);
  }

  /**
   * 메뉴 생성
   * FR-006: 관리자는 메뉴 항목을 생성할 수 있어야 한다
   * FR-007: 시스템은 계층형 메뉴 구조를 지원해야 한다
   */
  async create(dto: CreateMenuDto): Promise<Menu> {
    const newMenu: Menu = {
      id: generateId(),
      name: dto.name,
      path: dto.path,
      icon: dto.icon,
      parentId: dto.parentId,
      order: dto.order ?? menus.length + 1,
      isActive: true,
      permissions: dto.permissions ?? ['user', 'admin'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (dto.parentId) {
      // Add as child to parent menu
      const parent = this.findMenuById(menus, dto.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(newMenu);
      }
    } else {
      menus.push(newMenu);
    }

    return newMenu;
  }

  /**
   * 메뉴 수정
   * FR-006: 관리자는 메뉴 항목을 수정할 수 있어야 한다
   * FR-008: 관리자는 메뉴 표시 순서를 변경할 수 있어야 한다
   */
  async update(id: string, dto: UpdateMenuDto): Promise<Menu | null> {
    const menu = this.findMenuById(menus, id);
    if (!menu) return null;

    Object.assign(menu, {
      ...dto,
      updatedAt: new Date()
    });

    return menu;
  }

  /**
   * 메뉴 삭제
   * FR-006: 관리자는 메뉴 항목을 삭제할 수 있어야 한다
   */
  async delete(id: string): Promise<boolean> {
    const index = menus.findIndex(m => m.id === id);
    if (index !== -1) {
      menus.splice(index, 1);
      return true;
    }

    // Check in children
    for (const menu of menus) {
      if (menu.children) {
        const childIndex = menu.children.findIndex(c => c.id === id);
        if (childIndex !== -1) {
          menu.children.splice(childIndex, 1);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 메뉴 순서 변경
   * FR-008: 관리자는 메뉴 표시 순서를 변경할 수 있어야 한다
   */
  async reorder(menuOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of menuOrders) {
      const menu = this.findMenuById(menus, id);
      if (menu) {
        menu.order = order;
        menu.updatedAt = new Date();
      }
    }
  }

  /**
   * 사용자 권한에 따른 메뉴 필터링
   * FR-009: 메뉴 항목별로 접근 권한을 설정할 수 있어야 한다
   */
  async findByUserRole(role: string): Promise<Menu[]> {
    const allMenus = await this.findAll();
    return this.filterByPermission(allMenus, role);
  }

  // Private methods

  private buildMenuTree(items: Menu[]): Menu[] {
    return items
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item,
        children: item.children?.sort((a, b) => a.order - b.order)
      }));
  }

  private findMenuById(items: Menu[], id: string): Menu | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findMenuById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private filterByPermission(items: Menu[], role: string): Menu[] {
    return items
      .filter(item => item.isActive && item.permissions.includes(role))
      .map(item => ({
        ...item,
        children: item.children ? this.filterByPermission(item.children, role) : undefined
      }));
  }
}

export const menuService = new MenuService();
