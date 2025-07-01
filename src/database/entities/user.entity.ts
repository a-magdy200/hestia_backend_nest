import { IsEmail, IsEnum, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
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

import { UserRole, UserStatus, UserVerificationStatus } from '../../interfaces/enums/user.enum';

/**
 * User entity
 * Represents a user account in the system with authentication and profile information
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['tenantId', 'email'])
@Index(['status'])
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  tenantId?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @Column({
    type: 'enum',
    enum: UserVerificationStatus,
    default: UserVerificationStatus.UNVERIFIED,
  })
  @IsEnum(UserVerificationStatus)
  emailVerificationStatus!: UserVerificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  passwordChangedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  lockedAt?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  lockReason?: string;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  lastFailedLoginAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  /**
   * Validate email format before insert/update
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validate password hash before insert/update
   */
  @BeforeInsert()
  @BeforeUpdate()
  validatePasswordHash(): void {
    if (!this.passwordHash || this.passwordHash.length < 8) {
      throw new Error('Password hash must be at least 8 characters long');
    }
  }
}
