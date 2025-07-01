import { Provider } from '@nestjs/common';

import { EnvVar } from './enums/environment.enum';
import { getString, getNumber } from './utils/env.util';

/**
 * Configuration interface for exception filter
 */
export interface ExceptionFilterConfig {
  includeStackTraces: boolean;
  maxErrorDetailsSize: number;
  sanitizeErrors: boolean;
  logErrorThreshold: number;
}

/**
 * Exception filter configuration provider
 * Provides environment-based configuration for the global exception filter
 */
export const EXCEPTION_FILTER_CONFIG_PROVIDER: Provider = {
  provide: 'EXCEPTION_FILTER_CONFIG',
  useValue: {
    includeStackTraces: getString(EnvVar.NODE_ENV) === 'development',
    maxErrorDetailsSize: getNumber(EnvVar.MAX_ERROR_DETAILS_SIZE, 1024),
    sanitizeErrors: getString(EnvVar.NODE_ENV) === 'production',
    logErrorThreshold: getNumber(EnvVar.ERROR_LOG_THRESHOLD, 100),
  } as ExceptionFilterConfig,
};
