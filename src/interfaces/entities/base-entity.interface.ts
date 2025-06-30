/**
 * Base entity interface
 * Defines common properties for all domain entities
 */
export interface IBaseEntity {
  /** Unique identifier */
  id: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Soft delete timestamp */
  deletedAt?: Date;
}
