/**
 * Audit Log entity interface
 * Represents an audit log entry in the system
 */
import {
  AuditAction,
  AuditResourceType,
  AuditSeverity,
  AuditStatus,
  AuditSource,
  AuditOutcome,
} from '../enums/audit.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IAuditLogEntity extends IBaseEntity {
  /** User who performed the action */
  userId: string;
  /** Action performed */
  action: AuditAction;
  /** Resource type */
  resourceType: AuditResourceType;
  /** Resource ID */
  resourceId: string;
  /** Severity of the event */
  severity: AuditSeverity;
  /** Status of the audit event */
  status: AuditStatus;
  /** Source of the event */
  source: AuditSource;
  /** Outcome of the event */
  outcome: AuditOutcome;
  /** Additional audit log metadata */
  metadata?: Record<string, unknown>;
}
