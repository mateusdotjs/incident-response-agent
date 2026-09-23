import {
  insertDatabaseMetrics,
  insertDeployments,
  insertIncidents,
  insertLogs,
  insertMetrics,
} from '../apply';
import type { SeedContext } from '../types';

const PRODUCTION_DB = 'production-db';

export async function seedDatabaseOverload(ctx: SeedContext) {
  await insertDeployments(ctx, [
    {
      service: 'checkout',
      version: '2.4.0',
      commitSha: 'b71e9a',
      status: 'success',
      deployedAt: ctx.t(600),
      changes: ['Stable release'],
    },
  ]);

  await insertMetrics(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(130),
      metric: 'error_rate',
      value: 0.3,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 1.2,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 4.5,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(130),
      metric: 'latency_p95',
      value: 220,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 1850,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.12,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 105,
    },
  ]);

  await insertDatabaseMetrics(ctx, [
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(130),
      cpu: 45,
      connections: 110,
      queryLatency: 40,
    },
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(120),
      cpu: 72,
      connections: 185,
      queryLatency: 95,
    },
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(100),
      cpu: 88,
      connections: 240,
      queryLatency: 180,
    },
  ]);

  await insertLogs(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(102),
      level: 'ERROR',
      message: 'DatabaseQueryTimeout',
      metadata: { database: PRODUCTION_DB, timeoutMs: 3000 },
    },
    {
      service: 'checkout',
      timestamp: ctx.t(101),
      level: 'ERROR',
      message: 'DatabaseConnectionPoolExhausted',
      metadata: { database: PRODUCTION_DB },
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      level: 'WARN',
      message: 'Slow database query',
      metadata: { database: PRODUCTION_DB, durationMs: 2800 },
    },
  ]);

  await insertIncidents(ctx, [
    {
      service: 'checkout',
      title: 'Checkout latency and errors during database pressure',
      description:
        'Checkout degradation coincides with elevated database metrics.',
      severity: 'high',
      status: 'investigating',
      startedAt: ctx.t(105),
    },
  ]);
}
