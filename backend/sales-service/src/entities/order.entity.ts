import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OrderStatus } from '../models/sales.model';
import { LineItemEntity } from './line-item.entity';

@Entity('orders')
@Index(['storeId'])
@Index(['storeId', 'orderId'], { unique: true })
@Index(['status'])
@Index(['channel'])
@Index(['createdAt'])
@Index(['settledAt'])
export class OrderEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  storeId!: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  orderId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 10, default: 'KRW' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'varchar', length: 50 })
  channel!: string;

  @OneToMany(() => LineItemEntity, (lineItem) => lineItem.order, {
    cascade: true,
    eager: true,
  })
  lineItems!: LineItemEntity[];
}

