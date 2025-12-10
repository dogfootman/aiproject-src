export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  recipientId: string;
  senderId?: string;
  status: NotificationStatus;
  readAt?: Date;
  sentAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 'push' | 'email' | 'sms' | 'in-app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  content: string;
  recipientId: string;
  senderId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
