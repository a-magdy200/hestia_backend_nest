import { EnvVar } from '../enums/environment.enum';

/**
 * Environment variable utility functions
 * Provides type-safe access to environment variables with proper defaults
 */
export function getString(key: EnvVar, defaultValue = ''): string {
  const value = process.env[key];
  return value || defaultValue;
}

/**
 * Get environment variable as number
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 * @returns Environment variable value as number
 */
export function getNumber(key: EnvVar, defaultValue: number): number {
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
export function getBoolean(key: EnvVar, defaultValue = false): boolean {
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
export function getArray(key: EnvVar, defaultValue: string[] = []): string[] {
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
export function has(key: EnvVar): boolean {
  return !!process.env[key];
}

/**
 * Get environment variable with fallback to another key
 * @param primaryKey - Primary environment variable key
 * @param fallbackKey - Fallback environment variable key
 * @param defaultValue - Default value if neither key is found
 * @returns Environment variable value with fallback
 */
export function getWithFallback(
  primaryKey: EnvVar,
  fallbackKey: EnvVar,
  defaultValue = '',
): string {
  return process.env[primaryKey] || process.env[fallbackKey] || defaultValue;
}
