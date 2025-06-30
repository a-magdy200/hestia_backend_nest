/**
 * Notification entity interface
 * Represents a notification in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface INotificationEntity extends IBaseEntity {
  /** Notification type */
  type: string;
  /** Notification message */
  message: string;
  /** User ID to whom the notification is sent */
  userId: string;
  /** Read status */
  isRead: boolean;
  /** Read timestamp */
  readAt?: Date;
  /** Additional notification metadata */
  metadata?: Record<string, unknown>;
}
