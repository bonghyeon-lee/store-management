import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../models/notification.model';
import { NotificationTemplate } from '../models/template.model';
import { SendNotificationInput } from '../models/inputs.model';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationTemplateEntity } from '../entities/template.entity';
import { EmailService } from '../services/email.service';

// 템플릿 변수 치환 함수
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>,
): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationTemplateEntity)
    private templateRepository: Repository<NotificationTemplateEntity>,
    private emailService: EmailService,
  ) {
    // 초기 샘플 템플릿 데이터 생성
    this.initializeSampleTemplates();
  }

  private async initializeSampleTemplates(): Promise<void> {
    const existingTemplates = await this.templateRepository.count();
    if (existingTemplates > 0) {
      return; // 이미 템플릿이 있으면 스킵
    }

    const sampleTemplates = [
      {
        name: '무단결근 알림',
        subject: '[{storeName}] 무단결근 알림',
        content:
          '{employeeName}님의 {date} 무단결근이 감지되었습니다.',
        type: NotificationType.EMAIL,
      },
      {
        name: '재고 부족 알림',
        subject: '[{storeName}] 재고 부족 알림',
        content:
          '{productName}의 재고가 {currentQuantity}개로 안전재고({reorderPoint}개) 이하로 떨어졌습니다.',
        type: NotificationType.EMAIL,
      },
      {
        name: '매출 급감 알림',
        subject: '[{storeName}] 매출 급감 알림',
        content:
          '{storeName}의 {date} 매출이 {amount}원으로 전일 대비 {percentage}% 감소했습니다.',
        type: NotificationType.EMAIL,
      },
    ];

    for (const template of sampleTemplates) {
      const entity = this.templateRepository.create(template);
      await this.templateRepository.save(entity);
    }
  }

  // 엔티티를 GraphQL 모델로 변환
  private mapEntityToModel(entity: NotificationEntity): Notification {
    return {
      id: entity.id,
      storeId: entity.storeId,
      employeeId: entity.employeeId,
      type: entity.type,
      recipient: entity.recipient,
      subject: entity.subject,
      content: entity.content,
      status: entity.status,
      sentAt: entity.sentAt?.toISOString(),
      errorMessage: entity.errorMessage,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  // 템플릿 엔티티를 GraphQL 모델로 변환
  private mapTemplateEntityToModel(
    entity: NotificationTemplateEntity,
  ): NotificationTemplate {
    return {
      id: entity.id,
      name: entity.name,
      subject: entity.subject,
      content: entity.content,
      type: entity.type,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  @Query(() => Notification, { nullable: true, description: '알림 조회' })
  async notification(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Notification | null> {
    const entity = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!entity) return null;
    return this.mapEntityToModel(entity);
  }

  @Query(() => [Notification], { description: '알림 목록 조회' })
  async notifications(
    @Args('storeId', { type: () => ID, nullable: true }) storeId?: string,
    @Args('employeeId', { type: () => ID, nullable: true })
    employeeId?: string,
    @Args('status', { type: () => NotificationStatus, nullable: true })
    status?: NotificationStatus,
    @Args('type', { type: () => NotificationType, nullable: true })
    type?: NotificationType,
  ): Promise<Notification[]> {
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (type) where.type = type;

    const entities = await this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapEntityToModel(entity));
  }

  @Mutation(() => Notification, { description: '알림 발송' })
  async sendNotification(
    @Args('input') input: SendNotificationInput,
  ): Promise<Notification> {
    const entity = this.notificationRepository.create({
      storeId: input.storeId,
      employeeId: input.employeeId,
      type: input.type,
      recipient: input.recipient,
      subject: input.subject,
      content: input.content,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(entity);

    // 실제 이메일 발송 (비동기 처리)
    try {
      await this.emailService.sendNotification(
        input.type,
        input.recipient,
        input.subject,
        input.content,
      );

      entity.status = NotificationStatus.SENT;
      entity.sentAt = new Date();
    } catch (error: any) {
      entity.status = NotificationStatus.FAILED;
      entity.errorMessage = error.message || '알림 발송 실패';
    }

    await this.notificationRepository.save(entity);
    return this.mapEntityToModel(entity);
  }

  // 템플릿 관리 기능
  @Query(() => NotificationTemplate, {
    nullable: true,
    description: '템플릿 조회',
  })
  async template(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<NotificationTemplate | null> {
    const entity = await this.templateRepository.findOne({
      where: { id },
    });
    if (!entity) return null;
    return this.mapTemplateEntityToModel(entity);
  }

  @Query(() => [NotificationTemplate], {
    description: '템플릿 목록 조회',
  })
  async notificationTemplates(): Promise<NotificationTemplate[]> {
    const entities = await this.templateRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapTemplateEntityToModel(entity));
  }

  @Mutation(() => NotificationTemplate, { description: '템플릿 생성' })
  async createTemplate(
    @Args('name') name: string,
    @Args('subject') subject: string,
    @Args('content') content: string,
    @Args('type') type: NotificationType,
  ): Promise<NotificationTemplate> {
    const entity = this.templateRepository.create({
      name,
      subject,
      content,
      type,
    });

    await this.templateRepository.save(entity);
    return this.mapTemplateEntityToModel(entity);
  }

  @Mutation(() => NotificationTemplate, { description: '템플릿 수정' })
  async updateTemplate(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('subject', { nullable: true }) subject?: string,
    @Args('content', { nullable: true }) content?: string,
  ): Promise<NotificationTemplate> {
    const entity = await this.templateRepository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${id}`);
    }

    if (name) entity.name = name;
    if (subject) entity.subject = subject;
    if (content) entity.content = content;

    await this.templateRepository.save(entity);
    return this.mapTemplateEntityToModel(entity);
  }

  @Mutation(() => Boolean, { description: '템플릿 삭제' })
  async deleteTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const result = await this.templateRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 템플릿을 사용하여 알림 발송
  @Mutation(() => Notification, {
    description: '템플릿을 사용하여 알림 발송',
  })
  async sendNotificationWithTemplate(
    @Args('templateId', { type: () => ID }) templateId: string,
    @Args('recipient') recipient: string,
    @Args('variables', { type: () => String, nullable: true })
    variablesJson?: string,
  ): Promise<Notification> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${templateId}`);
    }

    const variables: Record<string, string> = variablesJson
      ? JSON.parse(variablesJson)
      : {};

    const subject = replaceTemplateVariables(template.subject, variables);
    const content = replaceTemplateVariables(template.content, variables);

    return this.sendNotification({
      recipient,
      subject,
      content,
      type: template.type,
    });
  }

  // 알림 통계 조회
  @Query(() => String, { description: '알림 통계 조회 (JSON 형태로 반환)' })
  async notificationStats(
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<string> {
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', {
        endDate,
      });
    }

    const total = await queryBuilder.getCount();

    const sent = await queryBuilder
      .clone()
      .andWhere('notification.status = :status', {
        status: NotificationStatus.SENT,
      })
      .getCount();

    const failed = await queryBuilder
      .clone()
      .andWhere('notification.status = :status', {
        status: NotificationStatus.FAILED,
      })
      .getCount();

    const pending = await queryBuilder
      .clone()
      .andWhere('notification.status = :status', {
        status: NotificationStatus.PENDING,
      })
      .getCount();

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