import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LoggingService } from '../logging.service';

/**
 * Password service for password operations
 * Handles password hashing, verification, and validation
 */
@Injectable()
export class PasswordService {
  /**
   * Default salt rounds for password hashing
   */
  private readonly DEFAULT_SALT_ROUNDS = 12;

  /**
   * Constructor for PasswordService
   * @param loggingService - Logging service for audit trails
   */
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Hash password with bcrypt
   * @param password - Plain text password
   * @param requestId - Request identifier
   * @param saltRounds - Number of salt rounds (default: 12)
   * @returns Hashed password
   */
  async hashPassword(
    password: string,
    requestId: string,
    saltRounds: number = this.DEFAULT_SALT_ROUNDS,
  ): Promise<string> {
    this.loggingService.debug('Hashing password', { requestId, saltRounds });

    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      this.loggingService.debug('Password hashed successfully', { requestId });

      return hashedPassword;
    } catch (error) {
      this.loggingService.error('Password hashing failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify password against hash
   * @param password - Plain text password
   * @param hash - Password hash
   * @param requestId - Request identifier
   * @returns True if password matches hash
   */
  async verifyPassword(password: string, hash: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Verifying password', { requestId });

    try {
      if (!password || !hash) {
        this.loggingService.warn('Password verification failed: Missing password or hash', {
          requestId,
        });
        return false;
      }

      const isValid = await bcrypt.compare(password, hash);

      this.loggingService.debug('Password verification completed', {
        requestId,
        isValid,
      });

      return isValid;
    } catch (error) {
      this.loggingService.error('Password verification failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Validate password strength
   * @param password - Plain text password
   * @param requestId - Request identifier
   * @returns Validation result with score and feedback
   */
  validatePasswordStrength(
    password: string,
    requestId: string,
  ): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    this.loggingService.debug('Validating password strength', { requestId });

    const feedback: string[] = [];
    let score = 0;

    // Check length and add to score
    score += this.checkPasswordLength(password, feedback);

    // Check character variety and add to score
    score += this.checkCharacterVariety(password);

    // Check for missing character types
    this.checkMissingCharacterTypes(password, feedback);

    // Check for common patterns
    score = this.checkCommonPatterns(password, score, feedback);

    // Check for repeated characters
    score = this.checkRepeatedCharacters(password, score, feedback);

    const isValid = score >= 3 && feedback.length === 0;

    this.loggingService.debug('Password strength validation completed', {
      requestId,
      score,
      isValid,
      feedbackCount: feedback.length,
    });

    return {
      isValid,
      score: Math.min(5, score),
      feedback,
    };
  }

  /**
   * Check password length and return score
   */
  private checkPasswordLength(password: string, feedback: string[]): number {
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
      return 0;
    }
    return password.length >= 12 ? 2 : 1;
  }

  /**
   * Check character variety and return score
   */
  private checkCharacterVariety(password: string): number {
    let score = 0;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }

  /**
   * Check for missing character types and add feedback
   */
  private checkMissingCharacterTypes(password: string, feedback: string[]): void {
    if (!/[a-z]/.test(password)) {
      feedback.push('Include at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push('Include at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      feedback.push('Include at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Include at least one special character');
    }
  }

  /**
   * Check for common patterns and adjust score
   */
  private checkCommonPatterns(password: string, score: number, feedback: string[]): number {
    const commonPatterns = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'user',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
    ];

    const lowerPassword = password.toLowerCase();
    if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
      feedback.push('Avoid common password patterns');
      return Math.max(0, score - 2);
    }
    return score;
  }

  /**
   * Check for repeated characters and adjust score
   */
  private checkRepeatedCharacters(password: string, score: number, feedback: string[]): number {
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeated characters');
      return Math.max(0, score - 1);
    }
    return score;
  }

  /**
   * Generate secure random password
   * @param length - Password length (default: 16)
   * @param requestId - Request identifier
   * @returns Generated password
   */
  generateSecurePassword(length = 16, requestId: string): string {
    this.loggingService.debug('Generating secure password', { requestId, length });

    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    let password = '';

    // Ensure at least one character from each category
    password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
    password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
    password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
    password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

    // Fill remaining length with random characters
    const allChars = charset.lowercase + charset.uppercase + charset.numbers + charset.symbols;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    this.loggingService.debug('Secure password generated', { requestId, length });

    return password;
  }

  /**
   * Check if password needs rehashing
   * @param hash - Current password hash
   * @param requestId - Request identifier
   * @returns True if password needs rehashing
   */
  needsRehash(hash: string, requestId: string): boolean {
    this.loggingService.debug('Checking if password needs rehash', { requestId });

    try {
      const needsRehash = bcrypt.getRounds(hash) < this.DEFAULT_SALT_ROUNDS;

      this.loggingService.debug('Password rehash check completed', {
        requestId,
        needsRehash,
        currentRounds: bcrypt.getRounds(hash),
        targetRounds: this.DEFAULT_SALT_ROUNDS,
      });

      return needsRehash;
    } catch (error) {
      this.loggingService.error('Password rehash check failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return true; // Rehash if we can't determine current rounds
    }
  }

  /**
   * Get hash information
   * @param hash - Password hash
   * @param requestId - Request identifier
   * @returns Hash information
   */
  getHashInfo(
    hash: string,
    requestId: string,
  ): {
    rounds: number;
    algorithm: string;
    isValid: boolean;
  } {
    this.loggingService.debug('Getting hash information', { requestId });

    try {
      const rounds = bcrypt.getRounds(hash);
      const isValid = rounds > 0;

      this.loggingService.debug('Hash information retrieved', {
        requestId,
        rounds,
        isValid,
      });

      return {
        rounds,
        algorithm: 'bcrypt',
        isValid,
      };
    } catch (error) {
      this.loggingService.error('Failed to get hash information', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        rounds: 0,
        algorithm: 'unknown',
        isValid: false,
      };
    }
  }
}
