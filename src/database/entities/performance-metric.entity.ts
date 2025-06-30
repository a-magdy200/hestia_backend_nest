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
 * Performance metric entity
 * Stores detailed performance metrics for analysis
 */
@Entity('performance_metrics')
@Index(['timestamp'])
@Index(['metricType'])
@Index(['service'])
export class PerformanceMetric implements IBaseEntity {
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

  @Column({ length: 50 })
  metricType!: string;

  @Column({ length: 50 })
  service!: string;

  @Column({ type: 'double precision' })
  duration!: number;

  @Column({ type: 'int', default: 1 })
  count!: number;

  @Column({ type: 'double precision' })
  minDuration!: number;

  @Column({ type: 'double precision' })
  maxDuration!: number;

  @Column({ type: 'double precision' })
  avgDuration!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;
}
