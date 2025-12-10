/**
 * Settings Service
 * FR-017 ~ FR-019: 환경설정 관리
 */

import { generateId } from '@/shared/utils';
import type { Setting, SettingHistory, SiteConfig, UpdateSettingDto } from './settings.types';

// In-memory store for PoC
let settings: Setting[] = [
  {
    id: 'setting-001',
    key: 'site.name',
    value: 'AI Project',
    type: 'string',
    category: 'general',
    label: '사이트명',
    description: '사이트 이름을 설정합니다.',
    isEditable: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'setting-002',
    key: 'site.description',
    value: '서비스 플랫폼 기반 어플리케이션',
    type: 'string',
    category: 'general',
    label: '사이트 설명',
    isEditable: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'setting-003',
    key: 'site.primaryColor',
    value: '#3b82f6',
    type: 'string',
    category: 'appearance',
    label: '기본 색상',
    isEditable: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'setting-004',
    key: 'site.maintenanceMode',
    value: 'false',
    type: 'boolean',
    category: 'general',
    label: '유지보수 모드',
    description: '활성화 시 일반 사용자 접근이 제한됩니다.',
    isEditable: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'setting-005',
    key: 'notification.email.enabled',
    value: 'true',
    type: 'boolean',
    category: 'notification',
    label: '이메일 알림',
    isEditable: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

let settingHistories: SettingHistory[] = [];

export class SettingsService {
  /**
   * 전체 설정 조회
   */
  async findAll(): Promise<Setting[]> {
    return [...settings];
  }

  /**
   * 카테고리별 설정 조회
   */
  async findByCategory(category: string): Promise<Setting[]> {
    return settings.filter(s => s.category === category);
  }

  /**
   * 설정 키로 조회
   */
  async findByKey(key: string): Promise<Setting | null> {
    return settings.find(s => s.key === key) || null;
  }

  /**
   * 설정 값 조회
   */
  async getValue(key: string): Promise<string | null> {
    const setting = await this.findByKey(key);
    return setting?.value || null;
  }

  /**
   * 설정 수정
   * FR-017: 관리자는 사이트 기본 정보를 설정할 수 있어야 한다
   * FR-019: 시스템은 설정 변경 이력을 기록해야 한다
   */
  async update(key: string, dto: UpdateSettingDto, userId: string): Promise<Setting | null> {
    const setting = settings.find(s => s.key === key);
    if (!setting) return null;

    if (!setting.isEditable) {
      throw new Error('이 설정은 수정할 수 없습니다.');
    }

    // Record history
    settingHistories.push({
      id: generateId(),
      settingId: setting.id,
      previousValue: setting.value,
      newValue: dto.value,
      changedBy: userId,
      changedAt: new Date()
    });

    // Update setting
    setting.value = dto.value;
    setting.updatedAt = new Date();
    setting.updatedBy = userId;

    return setting;
  }

  /**
   * 사이트 설정 일괄 조회
   */
  async getSiteConfig(): Promise<SiteConfig> {
    const getValue = async (key: string, defaultValue: string) => {
      const value = await this.getValue(key);
      return value || defaultValue;
    };

    return {
      siteName: await getValue('site.name', 'AI Project'),
      siteDescription: await getValue('site.description', ''),
      siteLogo: await getValue('site.logo', ''),
      favicon: await getValue('site.favicon', ''),
      primaryColor: await getValue('site.primaryColor', '#3b82f6'),
      language: await getValue('site.language', 'ko'),
      timezone: await getValue('site.timezone', 'Asia/Seoul'),
      dateFormat: await getValue('site.dateFormat', 'YYYY-MM-DD'),
      emailFrom: await getValue('notification.email.from', ''),
      maintenanceMode: (await getValue('site.maintenanceMode', 'false')) === 'true'
    };
  }

  /**
   * 설정 변경 이력 조회
   * FR-019: 시스템은 설정 변경 이력을 기록해야 한다
   */
  async getHistory(settingKey?: string): Promise<SettingHistory[]> {
    if (settingKey) {
      const setting = await this.findByKey(settingKey);
      if (!setting) return [];
      return settingHistories.filter(h => h.settingId === setting.id);
    }
    return [...settingHistories].sort((a, b) =>
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }
}

export const settingsService = new SettingsService();
