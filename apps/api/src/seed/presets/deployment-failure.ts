import {
  insertDatabaseMetrics,
  insertDeployments,
  insertIncidents,
  insertLogs,
  insertMetrics,
} from '../apply';
import type { SeedContext } from '../types';

const PRODUCTION_DB = 'production-db';

export async function seedDeploymentFailure(ctx: SeedContext) {
  await insertMetrics(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 0.2,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(115),
      metric: 'error_rate',
      value: 0.3,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(105),
      metric: 'error_rate',
      value: 8.7,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 11.2,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(120),
      metric: 'latency_p95',
      value: 180,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 420,
    },
    {
      service: 'payment',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 0.1,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.15,
    },
    {
      service: 'payment',
      timestamp: ctx.t(120),
      metric: 'latency_p95',
      value: 95,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 110,
    },
  ]);

  await insertDeployments(ctx, [
    {
      service: 'checkout',
      version: '2.4.0',
      commitSha: 'b71e9a',
      status: 'success',
      deployedAt: ctx.t(200),
      changes: ['Routine dependency updates'],
    },
    {
      service: 'checkout',
      version: '2.4.1',
      commitSha: 'a81f2c',
      status: 'success',
      deployedAt: ctx.t(110),
      changes: ['Changed payment client timeout', 'Updated retry policy'],
    },
  ]);

  await insertLogs(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(108),
      level: 'INFO',
      message: 'Deployment completed',
      metadata: { version: '2.4.1' },
    },
    {
      service: 'checkout',
      timestamp: ctx.t(98),
      level: 'ERROR',
      message: 'PaymentProviderTimeout',
      metadata: {
        provider: 'acme-pay',
        timeout: 5000,
        requestId: 'req_seed_1',
      },
    },
    {
      service: 'checkout',
      timestamp: ctx.t(97),
      level: 'ERROR',
      message: 'PaymentProviderTimeout',
      metadata: {
        provider: 'acme-pay',
        timeout: 5000,
        requestId: 'req_seed_2',
      },
    },
    {
      service: 'checkout',
      timestamp: ctx.t(96),
      level: 'ERROR',
      message: 'PaymentProviderTimeout',
      metadata: {
        provider: 'acme-pay',
        timeout: 5000,
        requestId: 'req_seed_3',
      },
    },
  ]);

  await insertDatabaseMetrics(ctx, [
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(120),
      cpu: 38,
      connections: 98,
      queryLatency: 28,
    },
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(100),
      cpu: 42,
      connections: 105,
      queryLatency: 32,
    },
  ]);

  await insertIncidents(ctx, [
    {
      service: 'checkout',
      title: 'Checkout elevated error rate',
      description:
        'Checkout is returning elevated errors after recent deployment.',
      severity: 'high',
      status: 'investigating',
      startedAt: ctx.t(102),
    },
  ]);
}
