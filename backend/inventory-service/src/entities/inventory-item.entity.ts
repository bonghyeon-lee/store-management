import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('inventory_items')
@Index(['storeId', 'sku'], { unique: true })
@Index(['storeId'])
@Index(['sku'])
@Index(['reorderPoint'])
export class InventoryItemEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  storeId!: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantityOnHand!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reserved!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorderPoint!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAuditAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

