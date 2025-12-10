export interface Layout {
  id: string;
  name: string;
  description?: string;
  template: LayoutTemplate;
  widgets: WidgetPlacement[];
  theme: ThemeConfig;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LayoutTemplate = 'default' | 'sidebar' | 'topnav' | 'minimal' | 'dashboard';

export interface WidgetPlacement {
  widgetId: string;
  position: string;
  order: number;
  config?: Record<string, unknown>;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

export interface CreateLayoutDto {
  name: string;
  description?: string;
  template: LayoutTemplate;
  theme?: Partial<ThemeConfig>;
}

export interface UpdateLayoutDto {
  name?: string;
  description?: string;
  template?: LayoutTemplate;
  widgets?: WidgetPlacement[];
  theme?: Partial<ThemeConfig>;
  isDefault?: boolean;
  isActive?: boolean;
}
