export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  permissions: string[];
  children?: Menu[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuDto {
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  order?: number;
  permissions?: string[];
}

export interface UpdateMenuDto {
  name?: string;
  path?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  permissions?: string[];
}
