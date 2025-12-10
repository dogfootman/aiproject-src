/**
 * Common Code Service
 * FR-024 ~ FR-027: 공통코드 관리
 */

import { generateId } from '@/shared/utils';
import type { CodeGroup, Code, CreateCodeGroupDto, CreateCodeDto } from './common-code.types';

// In-memory store for PoC
let codeGroups: CodeGroup[] = [
  {
    id: 'group-001',
    code: 'USER_STATUS',
    name: '사용자 상태',
    isActive: true,
    codes: [
      { id: 'code-001', groupId: 'group-001', code: 'ACTIVE', name: '활성', value: 'active', order: 1, isActive: true, labels: { ko: '활성', en: 'Active' }, createdAt: new Date(), updatedAt: new Date() },
      { id: 'code-002', groupId: 'group-001', code: 'INACTIVE', name: '비활성', value: 'inactive', order: 2, isActive: true, labels: { ko: '비활성', en: 'Inactive' }, createdAt: new Date(), updatedAt: new Date() },
      { id: 'code-003', groupId: 'group-001', code: 'LOCKED', name: '잠금', value: 'locked', order: 3, isActive: true, labels: { ko: '잠금', en: 'Locked' }, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'group-002',
    code: 'BOARD_TYPE',
    name: '게시판 유형',
    isActive: true,
    codes: [
      { id: 'code-004', groupId: 'group-002', code: 'GENERAL', name: '일반', value: 'general', order: 1, isActive: true, labels: { ko: '일반', en: 'General' }, createdAt: new Date(), updatedAt: new Date() },
      { id: 'code-005', groupId: 'group-002', code: 'NOTICE', name: '공지', value: 'notice', order: 2, isActive: true, labels: { ko: '공지', en: 'Notice' }, createdAt: new Date(), updatedAt: new Date() },
      { id: 'code-006', groupId: 'group-002', code: 'QNA', name: 'Q&A', value: 'qna', order: 3, isActive: true, labels: { ko: 'Q&A', en: 'Q&A' }, createdAt: new Date(), updatedAt: new Date() }
    ],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

// System code groups that cannot be deleted
const systemGroups = ['USER_STATUS', 'BOARD_TYPE'];

export class CommonCodeService {
  // ===== Code Group =====

  /**
   * 코드 그룹 목록 조회
   */
  async findAllGroups(): Promise<CodeGroup[]> {
    return codeGroups.filter(g => g.isActive);
  }

  /**
   * 코드 그룹 단건 조회
   */
  async findGroupById(id: string): Promise<CodeGroup | null> {
    return codeGroups.find(g => g.id === id) || null;
  }

  /**
   * 코드 그룹 코드로 조회
   */
  async findGroupByCode(code: string): Promise<CodeGroup | null> {
    return codeGroups.find(g => g.code === code) || null;
  }

  /**
   * 코드 그룹 생성
   * FR-024: 관리자는 코드 그룹을 생성할 수 있어야 한다
   */
  async createGroup(dto: CreateCodeGroupDto): Promise<CodeGroup> {
    const group: CodeGroup = {
      id: generateId(),
      code: dto.code,
      name: dto.name,
      description: dto.description,
      isActive: true,
      codes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    codeGroups.push(group);
    return group;
  }

  /**
   * 코드 그룹 삭제
   * FR-027: 시스템은 시스템 코드 그룹 삭제를 방지해야 한다
   */
  async deleteGroup(id: string): Promise<boolean> {
    const group = codeGroups.find(g => g.id === id);
    if (!group) return false;

    if (systemGroups.includes(group.code)) {
      throw new Error('시스템 코드 그룹은 삭제할 수 없습니다.');
    }

    group.isActive = false;
    return true;
  }

  // ===== Code =====

  /**
   * 그룹 내 코드 목록 조회
   * FR-026: 양식 요소에서 코드 그룹 사용
   */
  async findCodesByGroup(groupCode: string): Promise<Code[]> {
    const group = await this.findGroupByCode(groupCode);
    if (!group) return [];
    return group.codes.filter(c => c.isActive).sort((a, b) => a.order - b.order);
  }

  /**
   * 코드 추가
   * FR-025: 관리자는 코드 그룹 내에 코드 항목을 추가할 수 있어야 한다
   */
  async addCode(dto: CreateCodeDto): Promise<Code> {
    const group = codeGroups.find(g => g.id === dto.groupId);
    if (!group) {
      throw new Error('코드 그룹을 찾을 수 없습니다.');
    }

    const code: Code = {
      id: generateId(),
      groupId: dto.groupId,
      code: dto.code,
      name: dto.name,
      value: dto.value,
      order: dto.order ?? group.codes.length + 1,
      isActive: true,
      labels: dto.labels,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    group.codes.push(code);
    group.updatedAt = new Date();

    return code;
  }

  /**
   * 코드 삭제
   * FR-025: 관리자는 코드 항목을 삭제할 수 있어야 한다
   */
  async deleteCode(groupId: string, codeId: string): Promise<boolean> {
    const group = codeGroups.find(g => g.id === groupId);
    if (!group) return false;

    const code = group.codes.find(c => c.id === codeId);
    if (!code) return false;

    code.isActive = false;
    return true;
  }
}

export const commonCodeService = new CommonCodeService();
