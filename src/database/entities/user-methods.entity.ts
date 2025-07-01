import { UserRole, UserStatus, UserVerificationStatus } from '../../interfaces/enums/user.enum';

import { User } from './user.entity';

/**
 * User entity business logic methods
 * Provides business logic for user accounts
 */
export class UserMethods {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  /**
   * Check if user is active and not deleted
   * @returns True if account is active, false otherwise
   */
  isAccountActive(): boolean {
    return this.user.isActive && !this.user.isDeleted && this.user.status === UserStatus.ACTIVE;
  }

  /**
   * Check if user can login
   * @returns True if user can login, false otherwise
   */
  canLogin(): boolean {
    return (
      this.user.isActive &&
      this.user.status === UserStatus.ACTIVE &&
      this.user.emailVerificationStatus === UserVerificationStatus.VERIFIED &&
      this.user.failedLoginAttempts < 5
    );
  }

  /**
   * Check if user account is locked
   * @returns True if account is locked, false otherwise
   */
  isLocked(): boolean {
    return this.user.failedLoginAttempts >= 5 || this.user.status === UserStatus.LOCKED;
  }

  /**
   * Check if user email is verified
   * @returns True if email is verified, false otherwise
   */
  isEmailVerified(): boolean {
    return this.user.emailVerificationStatus === UserVerificationStatus.VERIFIED;
  }

  /**
   * Check if user is admin
   * @returns True if user is admin, false otherwise
   */
  isAdmin(): boolean {
    return this.user.role === UserRole.ADMIN || this.user.role === UserRole.SUPER_ADMIN;
  }

  /**
   * Check if user is super admin
   * @returns True if user is super admin, false otherwise
   */
  isSuperAdmin(): boolean {
    return this.user.role === UserRole.SUPER_ADMIN;
  }

  /**
   * Increment failed login attempts
   */
  incrementFailedLoginAttempts(): void {
    this.user.failedLoginAttempts += 1;
    this.user.lastFailedLoginAt = new Date();

    if (this.user.failedLoginAttempts >= 5) {
      this.user.status = UserStatus.LOCKED;
      this.user.lockedAt = new Date();
      this.user.lockReason = 'Too many failed login attempts';
    }
  }

  /**
   * Reset failed login attempts
   */
  resetFailedLoginAttempts(): void {
    this.user.failedLoginAttempts = 0;
    this.user.lastFailedLoginAt = undefined as unknown as Date;
  }

  /**
   * Mark email as verified
   */
  markEmailAsVerified(): void {
    this.user.emailVerificationStatus = UserVerificationStatus.VERIFIED;
    this.user.emailVerifiedAt = new Date();
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin(): void {
    this.user.lastLoginAt = new Date();
  }

  /**
   * Update password change timestamp
   */
  updatePasswordChange(): void {
    this.user.passwordChangedAt = new Date();
  }

  /**
   * Get display name for user
   * @returns Display name string
   */
  getDisplayName(): string {
    return this.user.email;
  }
}
