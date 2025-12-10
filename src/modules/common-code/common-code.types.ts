export interface CodeGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  codes: Code[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Code {
  id: string;
  groupId: string;
  code: string;
  name: string;
  value?: string;
  order: number;
  isActive: boolean;
  labels?: Record<string, string>; // 다국어 지원: { ko: '한글', en: 'English' }
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCodeGroupDto {
  code: string;
  name: string;
  description?: string;
}

export interface CreateCodeDto {
  groupId: string;
  code: string;
  name: string;
  value?: string;
  order?: number;
  labels?: Record<string, string>;
}
