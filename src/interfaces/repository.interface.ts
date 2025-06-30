import { IBaseEntity } from './entities/base-entity.interface';

/**
 * Base repository interface
 * Defines common CRUD operations for all repositories
 */
export interface IBaseRepository<T extends IBaseEntity> {
  /**
   * Find entity by ID
   * @param id - Entity unique identifier
   * @returns Promise resolving to entity or null
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities
   * @returns Promise resolving to array of entities
   */
  findAll(): Promise<T[]>;

  /**
   * Create new entity
   * @param data - Entity data
   * @returns Promise resolving to created entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update existing entity
   * @param id - Entity unique identifier
   * @param data - Update data
   * @returns Promise resolving to updated entity
   */
  update(id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete entity by ID
   * @param id - Entity unique identifier
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;

  /**
   * Soft delete entity by ID
   * @param id - Entity unique identifier
   * @returns Promise resolving to soft-deleted entity
   */
  softDelete(id: string): Promise<T>;
}
