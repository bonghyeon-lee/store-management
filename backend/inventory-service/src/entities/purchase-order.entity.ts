import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { PurchaseOrderStatus } from '../models/purchase-order.model';

@Entity('purchase_orders')
@Index(['storeId', 'sku'])
@Index(['status'])
@Index(['requestedBy'])
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  storeId!: string;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestedQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedQuantity?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  receivedQuantity?: number;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING,
  })
  status!: PurchaseOrderStatus;

  @Column({ type: 'varchar', length: 50 })
  requestedBy!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp' })
  requestedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

