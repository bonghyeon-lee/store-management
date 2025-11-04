import { InputType, Field } from '@nestjs/graphql';
import { NotificationType } from './notification.model';

@InputType()
export class SendNotificationInput {
  @Field({ nullable: true })
  storeId?: string;

  @Field({ nullable: true })
  employeeId?: string;

  @Field(() => NotificationType)
  type!: NotificationType;

  @Field()
  recipient!: string;

  @Field()
  subject!: string;

  @Field()
  content!: string;
}

