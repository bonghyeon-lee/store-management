import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { Notification, NotificationStatus, NotificationType } from '../models/notification.model';
import { NotificationTemplate } from '../models/template.model';
import { SendNotificationInput } from '../models/inputs.model';
import * as nodemailer from 'nodemailer';

// 인메모리 데이터 저장소 (MVP 단계)
export const notifications: Map<string, Notification> = new Map();
export const templates: Map<string, NotificationTemplate> = new Map();
let notificationIdCounter = 1;
let templateIdCounter = 1;

// 이메일 전송 설정 (MVP 단계, 프로덕션에서는 환경 변수로 관리)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// 템플릿 변수 치환 함수
const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

// 초기 샘플 템플릿 데이터
const initializeSampleTemplates = () => {
  const now = new Date().toISOString();
  
  templates.set('TEMPLATE-001', {
    id: 'TEMPLATE-001',
    name: '무단결근 알림',
    subject: '[{storeName}] 무단결근 알림',
    content: '{employeeName}님의 {date} 무단결근이 감지되었습니다.',
    type: 'EMAIL',
    createdAt: now,
    updatedAt: now,
  });

  templates.set('TEMPLATE-002', {
    id: 'TEMPLATE-002',
    name: '재고 부족 알림',
    subject: '[{storeName}] 재고 부족 알림',
    content: '{productName}의 재고가 {currentQuantity}개로 안전재고({reorderPoint}개) 이하로 떨어졌습니다.',
    type: 'EMAIL',
    createdAt: now,
    updatedAt: now,
  });

  templates.set('TEMPLATE-003', {
    id: 'TEMPLATE-003',
    name: '매출 급감 알림',
    subject: '[{storeName}] 매출 급감 알림',
    content: '{storeName}의 {date} 매출이 {amount}원으로 전일 대비 {percentage}% 감소했습니다.',
    type: 'EMAIL',
    createdAt: now,
    updatedAt: now,
  });
};

initializeSampleTemplates();

@Resolver(() => Notification)
export class NotificationResolver {
  @Query(() => Notification, { nullable: true, description: '알림 조회' })
  notification(@Args('id', { type: () => ID }) id: string): Notification | null {
    return notifications.get(id) || null;
  }

  @Query(() => [Notification], { description: '알림 목록 조회' })
  notifications(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('status', { type: () => NotificationStatus, nullable: true })
    status?: NotificationStatus,
    @Args('type', { type: () => NotificationType, nullable: true })
    type?: NotificationType
  ): Notification[] {
    let results = Array.from(notifications.values());

    if (storeId) {
      results = results.filter((n) => n.storeId === storeId);
    }

    if (employeeId) {
      results = results.filter((n) => n.employeeId === employeeId);
    }

    if (status) {
      results = results.filter((n) => n.status === status);
    }

    if (type) {
      results = results.filter((n) => n.type === type);
    }

    return results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  @Mutation(() => Notification, { description: '알림 발송' })
  async sendNotification(
    @Args('input') input: SendNotificationInput
  ): Promise<Notification> {
    const id = `notification-${notificationIdCounter++}`;
    const now = new Date().toISOString();

    const notification: Notification = {
      id,
      storeId: input.storeId,
      employeeId: input.employeeId,
      type: input.type,
      recipient: input.recipient,
      subject: input.subject,
      content: input.content,
      status: NotificationStatus.PENDING,
      createdAt: now,
    };

    notifications.set(id, notification);

    // 실제 이메일 발송 (비동기 처리)
    try {
      if (input.type === NotificationType.EMAIL) {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@store-management.com',
          to: input.recipient,
          subject: input.subject,
          text: input.content,
          html: `<p>${input.content.replace(/\n/g, '<br>')}</p>`,
        });

        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date().toISOString();
      } else {
        // SMS, SLACK 등은 MVP 단계에서 미구현
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date().toISOString();
      }
    } catch (error: any) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message || '알림 발송 실패';
    }

    notifications.set(id, notification);
    return notification;
  }

  // 템플릿 관리 기능
  @Query(() => NotificationTemplate, { nullable: true, description: '템플릿 조회' })
  template(@Args('id', { type: () => ID }) id: string): NotificationTemplate | null {
    return templates.get(id) || null;
  }

  @Query(() => [NotificationTemplate], { description: '템플릿 목록 조회' })
  notificationTemplates(): NotificationTemplate[] {
    return Array.from(templates.values());
  }

  @Mutation(() => NotificationTemplate, { description: '템플릿 생성' })
  createTemplate(
    @Args('name') name: string,
    @Args('subject') subject: string,
    @Args('content') content: string,
    @Args('type') type: string
  ): NotificationTemplate {
    const id = `TEMPLATE-${String(templateIdCounter++).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const template: NotificationTemplate = {
      id,
      name,
      subject,
      content,
      type,
      createdAt: now,
      updatedAt: now,
    };

    templates.set(id, template);
    return template;
  }

  @Mutation(() => NotificationTemplate, { description: '템플릿 수정' })
  updateTemplate(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('subject', { nullable: true }) subject?: string,
    @Args('content', { nullable: true }) content?: string
  ): NotificationTemplate {
    const template = templates.get(id);
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${id}`);
    }

    const updated: NotificationTemplate = {
      ...template,
      ...(name && { name }),
      ...(subject && { subject }),
      ...(content && { content }),
      updatedAt: new Date().toISOString(),
    };

    templates.set(id, updated);
    return updated;
  }

  @Mutation(() => Boolean, { description: '템플릿 삭제' })
  deleteTemplate(@Args('id', { type: () => ID }) id: string): boolean {
    return templates.delete(id);
  }

  // 알림 통계 조회
  @Query(() => String, { description: '알림 통계 조회 (JSON 형태로 반환)' })
  notificationStats(
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string
  ): string {
    let filtered = Array.from(notifications.values());

    if (startDate) {
      filtered = filtered.filter((n) => n.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((n) => n.createdAt <= endDate);
    }

    const total = filtered.length;
    const sent = filtered.filter((n) => n.status === NotificationStatus.SENT).length;
    const failed = filtered.filter((n) => n.status === NotificationStatus.FAILED).length;
    const pending = filtered.filter((n) => n.status === NotificationStatus.PENDING).length;

    const stats = {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
      failureRate: total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00',
    };

    return JSON.stringify(stats);
  }
}

