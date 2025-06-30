import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { IBaseEntity } from '@/interfaces/entities/base-entity.interface';

/**
 * Error log entity
 * Stores application errors for monitoring and debugging
 */
@Entity('error_logs')
@Index(['timestamp'])
@Index(['errorCode'])
@Index(['service'])
@Index(['userId'])
@Index(['tenantId'])
export class ErrorLog implements IBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ length: 100 })
  errorCode!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ length: 50 })
  service!: string;

  @Column({ length: 100, nullable: true })
  operation?: string;

  @Column({ type: 'uuid', nullable: true })
  requestId?: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, unknown>;

  @Column({ type: 'int', default: 1 })
  occurrenceCount!: number;
}
