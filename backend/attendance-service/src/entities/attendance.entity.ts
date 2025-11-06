import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AttendanceStatus } from '../models/attendance.model';

@Entity('attendances')
@Index(['storeId', 'date'])
@Index(['employeeId', 'date'])
@Index(['status'])
@Index(['storeId', 'employeeId', 'date'], { unique: true })
export class AttendanceEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  storeId!: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  employeeId!: string;

  @PrimaryColumn({ type: 'date' })
  date!: string;

  @Column({ type: 'timestamp', nullable: true })
  checkInAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutAt?: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PENDING,
  })
  status!: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  workingHours?: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}

