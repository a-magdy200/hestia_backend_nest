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
 * API request log entity
 * Stores detailed information about API requests for monitoring
 */
@Entity('api_request_logs')
@Index(['requestId'], { unique: true })
@Index(['timestamp'])
@Index(['userId'])
@Index(['tenantId'])
@Index(['statusCode'])
@Index(['method', 'endpoint'])
export class ApiRequestLog implements IBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', unique: true })
  requestId!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ length: 10 })
  method!: string;

  @Column({ length: 500 })
  endpoint!: string;

  @Column({ type: 'int' })
  statusCode!: number;

  @Column({ type: 'int' })
  responseTime!: number;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  requestBody?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  responseBody?: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'text', nullable: true })
  errorStack?: string;
}
