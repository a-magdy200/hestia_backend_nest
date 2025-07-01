import { IsOptional, IsString, MaxLength, IsEnum, IsUrl } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';

import { UserProfileVisibility } from '../../interfaces/enums/user.enum';

import { UserProfileValidators } from './user-profile-validators.entity';

/**
 * User profile entity
 * Represents detailed profile information for a user
 */
@Entity('user_profiles')
@Index(['userId'], { unique: true })
@Index(['visibility'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  coverImageUrl?: string;

  @Column({ type: 'enum', enum: UserProfileVisibility, default: UserProfileVisibility.PUBLIC })
  @IsEnum(UserProfileVisibility)
  visibility!: UserProfileVisibility;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  preferences?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  socialLinks?: Record<string, string>;

  @Column({ type: 'boolean', default: false })
  isPublicProfile!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  /**
   * Validate profile data before insert/update
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateProfile(): void {
    const validators = new UserProfileValidators(this);
    validators.validateProfile();
  }
}
