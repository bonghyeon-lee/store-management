import { Query, Resolver, Args, Mutation, ID } from '@nestjs/graphql';
import { Notification, NotificationStatus, NotificationType } from '../models/notification.model';
import { SendNotificationInput } from '../models/inputs.model';

// 인메모리 데이터 저장소 (MVP 단계)
export const notifications: Map<string, Notification> = new Map();
let notificationIdCounter = 1;

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
  sendNotification(
    @Args('input') input: SendNotificationInput
  ): Notification {
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

    // MVP 단계에서는 즉시 발송 성공으로 처리
    notification.status = NotificationStatus.SENT;
    notification.sentAt = now;

    notifications.set(id, notification);

    return notification;
  }
}

