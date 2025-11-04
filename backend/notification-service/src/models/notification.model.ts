import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
});

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  SLACK = 'SLACK',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
});

@ObjectType({ description: '알림' })
export class Notification {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  storeId?: string;

  @Field(() => ID, { nullable: true })
  employeeId?: string;

  @Field(() => NotificationType)
  type!: NotificationType;

  @Field()
  recipient!: string;

  @Field()
  subject!: string;

  @Field()
  content!: string;

  @Field(() => NotificationStatus)
  status!: NotificationStatus;

  @Field({ nullable: true })
  sentAt?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  createdAt!: string;
}

