import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';

/**
 * Recipe entity
 * Represents a recipe in the system
 */
@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  instructions!: string;

  @Column({ default: 0 })
  cookingTime!: number;

  @Column({ default: 0 })
  prepTime!: number;

  @Column({ default: 1 })
  servings!: number;

  @Column({ default: true })
  isPublic!: boolean;

  @Column({ default: false })
  isPublished!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
