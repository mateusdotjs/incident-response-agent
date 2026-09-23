import {
  insertDatabaseMetrics,
  insertDeployments,
  insertLogs,
  insertMetrics,
} from '../apply';
import type { SeedContext } from '../types';

const PRODUCTION_DB = 'production-db';

export async function seedHealthy(ctx: SeedContext) {
  await insertDeployments(ctx, [
    {
      service: 'checkout',
      version: '2.3.9',
      commitSha: '9aa01f',
      status: 'success',
      deployedAt: ctx.t(800),
      changes: ['Documentation updates'],
    },
  ]);

  await insertMetrics(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(130),
      metric: 'error_rate',
      value: 0.18,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 0.22,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(110),
      metric: 'error_rate',
      value: 0.19,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.21,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 210,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.08,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 88,
    },
    {
      service: 'orders',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.05,
    },
    {
      service: 'catalog',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 0.04,
    },
  ]);

  await insertLogs(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(105),
      level: 'INFO',
      message: 'Order placed successfully',
      metadata: { orderId: 'ord_demo_1' },
    },
    {
      service: 'payment',
      timestamp: ctx.t(104),
      level: 'INFO',
      message: 'Payment authorized',
      metadata: { provider: 'acme-pay' },
    },
  ]);

  await insertDatabaseMetrics(ctx, [
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(120),
      cpu: 35,
      connections: 88,
      queryLatency: 26,
    },
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(100),
      cpu: 38,
      connections: 92,
      queryLatency: 28,
    },
  ]);
}
