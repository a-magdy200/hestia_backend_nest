import { Request } from 'express';

/**
 * Extended Express Request interface
 * Adds custom properties for request tracking and context
 */
export interface IRequest extends Request {
  /** Unique request identifier for tracking */
  requestId: string;

  /** User context from authentication */
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
  };

  /** Tenant context for multi-tenancy */
  tenantId?: string;
}
