import { EnvVar } from '../enums/environment.enum';

/**
 * Environment variable utility functions
 * Provides type-safe access to environment variables with proper defaults
 */
export class EnvUtil {
  /**
   * Get environment variable as string
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value as string
   */
  static getString(key: EnvVar, defaultValue: string = ''): string {
    const value = process.env[key];
    return value || defaultValue;
  }

  /**
   * Get environment variable as number
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value as number
   */
  static getNumber(key: EnvVar, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get environment variable as boolean
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value as boolean
   */
  static getBoolean(key: EnvVar, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Get environment variable as array (comma-separated)
   * @param key - Environment variable key
   * @param defaultValue - Default value if not found
   * @returns Environment variable value as array
   */
  static getArray(key: EnvVar, defaultValue: string[] = []): string[] {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  /**
   * Check if environment variable exists
   * @param key - Environment variable key
   * @returns True if environment variable exists
   */
  static has(key: EnvVar): boolean {
    return !!process.env[key];
  }

  /**
   * Get environment variable with fallback to another key
   * @param primaryKey - Primary environment variable key
   * @param fallbackKey - Fallback environment variable key
   * @param defaultValue - Default value if neither key is found
   * @returns Environment variable value with fallback
   */
  static getWithFallback(
    primaryKey: EnvVar,
    fallbackKey: EnvVar,
    defaultValue: string = '',
  ): string {
    return process.env[primaryKey] || process.env[fallbackKey] || defaultValue;
  }
}
