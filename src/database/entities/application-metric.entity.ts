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
 * Application metrics entity
 * Stores application performance and business metrics
 */
@Entity('application_metrics')
@Index(['timestamp'])
@Index(['metricName'])
@Index(['service'])
export class ApplicationMetric implements IBaseEntity {
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
  metricName!: string;

  @Column({ length: 50 })
  service!: string;

  @Column({ type: 'double precision' })
  value!: number;

  @Column({ length: 20, default: 'count' })
  unit!: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: Record<string, string>;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;
}
