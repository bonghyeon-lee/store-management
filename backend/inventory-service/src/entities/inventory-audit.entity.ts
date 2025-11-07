import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('inventory_audits')
@Index(['storeId', 'sku'])
@Index(['auditDate'])
@Index(['performedBy'])
export class InventoryAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  storeId!: string;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousQuantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newQuantity!: number;

  @Column({ type: 'timestamp' })
  auditDate!: Date;

  @Column({ type: 'varchar', length: 50 })
  performedBy!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}

