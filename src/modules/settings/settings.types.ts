/**
 * Settings Module Types
 * FR-017 ~ FR-019: 환경설정 관리
 */

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description?: string;
  isEditable: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'image';
export type SettingCategory = 'general' | 'appearance' | 'notification' | 'security' | 'integration';

export interface SettingHistory {
  id: string;
  settingId: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  changedAt: Date;
}

export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  favicon?: string;
  primaryColor: string;
  language: string;
  timezone: string;
  dateFormat: string;
  emailFrom?: string;
  maintenanceMode: boolean;
}

export interface UpdateSettingDto {
  value: string;
}

export interface UpdateSiteConfigDto {
  siteName?: string;
  siteDescription?: string;
  siteLogo?: string;
  primaryColor?: string;
  maintenanceMode?: boolean;
}
