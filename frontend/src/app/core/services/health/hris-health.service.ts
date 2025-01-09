import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, timeout, retry } from 'rxjs/operators';
import { environmentOAuth } from '../../../../environments/env.auth';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  services: {
    database: {
      status: string;
      latency: number;
      error?: string;
      errorType?: string;
      connectionPool?: {
        total: number;
        idle: number;
        active: number;
      };
      dialect: string;
    };
    api: {
      status: string;
      responseTime: string;
    };
  };
  system: {
    memory: {
      total: number;
      free: number;
      used: number;
      usagePercentage: string;
      status: 'healthy' | 'warning';
    };
    cpu: {
      cores: number;
      model: string;
      loadAverage: number[];
      loadPercentage: string;
      status: 'healthy' | 'warning';
      uptime: number;
    };
    process: {
      uptime: number;
      memoryUsage: any;
      nodeVersion: string;
    };
  };
  thresholds?: {
    memory: number;
    cpu: number;
    dbTimeout: number;
  };
}

/**
 * Service responsible for monitoring HRIS system health status.
 * Implements caching, retry logic, and comprehensive health evaluation
 * to ensure reliable system status reporting.
 */
@Injectable({
  providedIn: 'root',
})
export class HrisHealthService {
  private readonly hrisUrl = environmentOAuth.hrisUrl;
  private healthCheckCache: { timestamp: number; status: boolean } | null =
    null;

  private readonly CACHE_DURATION_MS = 30000;
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_RETRY_DELAY_MS = 500;
  private readonly TIMEOUT_MS = 5000;
  private readonly MEMORY_WARNING_THRESHOLD = 95;
  private readonly CPU_WARNING_THRESHOLD = 95;

  constructor(private http: HttpClient) {}

  /**
   * Performs health check with built-in caching and retry mechanism.
   * @returns {Observable<boolean>} Observable that emits true if system is healthy
   * Implements:
   * - 15s response caching
   * - 5s timeout per request
   * - Up to 3 retries with exponential backoff
   * - Comprehensive health evaluation of API, DB, and system metrics
   */
  checkHealth(): Observable<boolean> {
    if (this.isCacheValid()) {
      return of(this.healthCheckCache!.status);
    }

    return this.http.get<HealthCheckResponse>(`${this.hrisUrl}/api/health`).pipe(
      timeout(this.TIMEOUT_MS),
      map((response) => {
        const isHealthy = this.evaluateHealthStatus(response);
        this.cacheHealthStatus(isHealthy);
        return isHealthy;
      }),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          const retryDelay =
            this.INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount - 1);
          console.warn(
            `Health check retry attempt ${retryCount}/${this.MAX_RETRIES}`,
            error
          );
          return timer(retryDelay);
        },
      }),
      catchError((error) => {
        console.error('Health check failed after retries:', error);
        this.cacheHealthStatus(false);
        return of(false);
      })
    );
  }

  /**
   * Validates if the cached health status is still within the validity period.
   * @returns {boolean} True if cache is valid (less than 15s old)
   */
  private isCacheValid(): boolean {
    if (!this.healthCheckCache) return false;
    return (
      Date.now() - this.healthCheckCache.timestamp < this.CACHE_DURATION_MS
    );
  }

  /**
   * Evaluates overall system health based on multiple metrics.
   * Applies graceful degradation logic to maintain operation when possible.
   * @param {HealthCheckResponse} response Health check response from backend
   * @returns {boolean} True if system is operational
   */
  private evaluateHealthStatus(response: HealthCheckResponse): boolean {
    console.debug('Health Check Metrics:', response);

    const isApiHealthy = response.services.api.status === 'healthy';
    const isDatabaseAcceptable =
      response.services.database.status === 'healthy' ||
      response.services.database.status === 'degraded';
    const isMemoryAcceptable =
      response.system.memory.status === 'healthy' ||
      (response.system.memory.status === 'warning' &&
        parseFloat(response.system.memory.usagePercentage) <
          this.MEMORY_WARNING_THRESHOLD);
    const isCpuAcceptable =
      response.system.cpu.status === 'healthy' ||
      (response.system.cpu.status === 'warning' &&
        parseFloat(response.system.cpu.loadPercentage) <
          this.CPU_WARNING_THRESHOLD);

    if (
      isApiHealthy &&
      isDatabaseAcceptable &&
      isMemoryAcceptable &&
      isCpuAcceptable
    ) {
      return true;
    } else if (isApiHealthy && isDatabaseAcceptable) {
      console.warn(
        `HRIS system metrics show warnings, but API and Database are acceptable
        for basic functionality. Proceeding with caution.`
      );
      return true;
    } else if (isApiHealthy) {
      console.warn(
        `HRIS database has issues, but API is healthy.
        OAuth might work, data transfer might be affected.`
      );
      return true;
    } else {
      console.error(`HRIS API is unhealthy. Blocking access.`);
      return false;
    }
  }

  /**
   * Stores health check result with timestamp for caching.
   * @param {boolean} status Health status to cache
   */
  private cacheHealthStatus(status: boolean): void {
    this.healthCheckCache = {
      timestamp: Date.now(),
      status,
    };
  }
}
