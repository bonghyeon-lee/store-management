import { ObjectType, Field, ID } from '@nestjs/graphql';
import { NotificationType } from './notification.model';

@ObjectType({ description: '알림 템플릿' })
export class NotificationTemplate {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  subject!: string;

  @Field()
  content!: string;

  @Field(() => NotificationType)
  type!: NotificationType;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
