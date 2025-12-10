/**
 * Notification Service
 * FR-032 ~ FR-035: 알림 관리
 */

import { generateId } from '@/shared/utils';
import type {
  Notification,
  NotificationType,
  NotificationStatus,
  CreateNotificationDto,
  NotificationTemplate
} from './notification.types';

// In-memory store for PoC
let notifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'in-app',
    title: '환영합니다',
    content: 'AI Project에 오신 것을 환영합니다.',
    recipientId: 'user-002',
    status: 'delivered',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

let templates: NotificationTemplate[] = [
  {
    id: 'tpl-001',
    name: '환영 메시지',
    type: 'in-app',
    subject: '환영합니다',
    body: '{{userName}}님, {{siteName}}에 오신 것을 환영합니다.',
    variables: ['userName', 'siteName'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'tpl-002',
    name: '비밀번호 재설정',
    type: 'email',
    subject: '비밀번호 재설정 요청',
    body: '{{userName}}님, 비밀번호 재설정 링크입니다: {{resetLink}}',
    variables: ['userName', 'resetLink'],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

export class NotificationService {
  /**
   * 사용자 알림 목록 조회
   * FR-033: 사용자는 알림 이력을 조회할 수 있어야 한다
   */
  async findByUser(userId: string): Promise<Notification[]> {
    return notifications
      .filter(n => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    return notifications.filter(n => n.recipientId === userId && n.status !== 'read').length;
  }

  /**
   * 알림 생성 및 발송
   * FR-032: 시스템은 다중 채널을 통한 알림 전송을 지원해야 한다
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification: Notification = {
      id: generateId(),
      type: dto.type,
      title: dto.title,
      content: dto.content,
      recipientId: dto.recipientId,
      senderId: dto.senderId,
      status: 'pending',
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Send notification based on type
    await this.send(notification);

    notifications.push(notification);
    return notification;
  }

  /**
   * 알림 읽음 처리
   * FR-034: 사용자는 알림을 읽음/안읽음 상태로 표시할 수 있어야 한다
   */
  async markAsRead(id: string, userId: string): Promise<boolean> {
    const notification = notifications.find(n => n.id === id && n.recipientId === userId);
    if (!notification) return false;

    notification.status = 'read';
    notification.readAt = new Date();
    notification.updatedAt = new Date();

    return true;
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    notifications
      .filter(n => n.recipientId === userId && n.status !== 'read')
      .forEach(n => {
        n.status = 'read';
        n.readAt = new Date();
        n.updatedAt = new Date();
        count++;
      });
    return count;
  }

  /**
   * 알림 삭제
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const index = notifications.findIndex(n => n.id === id && n.recipientId === userId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    return true;
  }

  /**
   * 템플릿 기반 알림 발송
   */
  async sendFromTemplate(
    templateId: string,
    recipientId: string,
    variables: Record<string, string>
  ): Promise<Notification> {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    // Replace variables in template
    let content = template.body;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.create({
      type: template.type,
      title: template.subject || template.name,
      content,
      recipientId
    });
  }

  // Private methods

  private async send(notification: Notification): Promise<void> {
    // In real implementation, send via appropriate channel
    switch (notification.type) {
      case 'email':
        // Send email
        console.log(`[Email] To: ${notification.recipientId}, Subject: ${notification.title}`);
        break;
      case 'push':
        // Send push notification
        console.log(`[Push] To: ${notification.recipientId}, Title: ${notification.title}`);
        break;
      case 'sms':
        // Send SMS
        console.log(`[SMS] To: ${notification.recipientId}, Content: ${notification.content}`);
        break;
      case 'in-app':
      default:
        // In-app notification (just store)
        console.log(`[In-App] To: ${notification.recipientId}, Title: ${notification.title}`);
    }

    notification.status = 'delivered';
    notification.sentAt = new Date();
  }
}

export const notificationService = new NotificationService();
