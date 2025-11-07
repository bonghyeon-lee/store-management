import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('line_items')
@Index(['orderStoreId', 'orderOrderId'])
@Index(['sku'])
export class LineItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  orderStoreId!: string;

  @Column({ type: 'varchar', length: 50 })
  orderOrderId!: string;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => OrderEntity, (order) => order.lineItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'orderStoreId', referencedColumnName: 'storeId' },
    { name: 'orderOrderId', referencedColumnName: 'orderId' },
  ])
  order!: OrderEntity;
}

