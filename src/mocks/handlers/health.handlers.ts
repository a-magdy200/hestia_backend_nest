/**
 * Health check handlers for MSW
 * Mocks health check endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockHealthData } from '../data/health.data';

/**
 * Health check handlers
 * Provides mock responses for health check endpoints
 */
export const healthHandlers = [
  /**
   * Basic health check endpoint
   * GET /health
   */
  http.get('/health', () => {
    return HttpResponse.json(mockHealthData.basic, { status: 200 });
  }),

  /**
   * Detailed health check endpoint
   * GET /health/detailed
   */
  http.get('/health/detailed', () => {
    return HttpResponse.json(mockHealthData.detailed, { status: 200 });
  }),

  /**
   * Database health check endpoint
   * GET /health/database
   */
  http.get('/health/database', () => {
    return HttpResponse.json(mockHealthData.detailed.services.database, { status: 200 });
  }),

  /**
   * Cache health check endpoint
   * GET /health/cache
   */
  http.get('/health/cache', () => {
    return HttpResponse.json(mockHealthData.detailed.services.cache, { status: 200 });
  }),

  /**
   * External services health check endpoint
   * GET /health/external
   */
  http.get('/health/external', () => {
    return HttpResponse.json(mockHealthData.readiness, { status: 200 });
  }),

  /**
   * Readiness probe endpoint
   * GET /health/ready
   */
  http.get('/health/ready', () => {
    return HttpResponse.json(mockHealthData.readiness, { status: 200 });
  }),

  /**
   * Liveness probe endpoint
   * GET /health/live
   */
  http.get('/health/live', () => {
    return HttpResponse.json(mockHealthData.liveness, { status: 200 });
  }),
];
