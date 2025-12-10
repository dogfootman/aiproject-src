/**
 * Configuration management for different stages
 * PoC | Dev | Production
 */

export type Stage = 'poc' | 'dev' | 'production';

export interface AppConfig {
  stage: Stage;
  database: DatabaseConfig;
  logging: LoggingConfig;
  features: FeatureFlags;
}

export interface DatabaseConfig {
  type: 'file' | 'mock' | 'memory' | 'postgresql';
  host?: string;
  port?: number;
  path?: string;
  ssl?: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'simple' | 'detailed' | 'json';
  includeTrace?: boolean;
  external?: boolean;
}

export interface FeatureFlags {
  authBypass?: boolean;
  mockDelay?: number;
  hotReload?: boolean;
  debugPanel?: boolean;
  maintenanceMode?: boolean;
}

/**
 * Get current stage from environment
 */
export function getStage(): Stage {
  const stage = process.env.NEXT_PUBLIC_STAGE || process.env.STAGE || 'poc';
  if (['poc', 'dev', 'production'].includes(stage)) {
    return stage as Stage;
  }
  return 'poc';
}

/**
 * Check if running in PoC stage
 */
export function isPoc(): boolean {
  return getStage() === 'poc';
}

/**
 * Check if running in development stage
 */
export function isDev(): boolean {
  return getStage() === 'dev';
}

/**
 * Check if running in production stage
 */
export function isProduction(): boolean {
  return getStage() === 'production';
}
