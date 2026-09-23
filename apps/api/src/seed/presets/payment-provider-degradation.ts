import {
  insertDatabaseMetrics,
  insertDeployments,
  insertIncidents,
  insertLogs,
  insertMetrics,
} from '../apply';
import type { SeedContext } from '../types';

const PRODUCTION_DB = 'production-db';

export async function seedPaymentProviderDegradation(ctx: SeedContext) {
  await insertDeployments(ctx, [
    {
      service: 'checkout',
      version: '2.4.0',
      commitSha: 'b71e9a',
      status: 'success',
      deployedAt: ctx.t(500),
      changes: ['Stable release'],
    },
    {
      service: 'payment',
      version: '1.8.0',
      commitSha: 'c02d11',
      status: 'success',
      deployedAt: ctx.t(400),
      changes: ['Config cleanup'],
    },
  ]);

  await insertMetrics(ctx, [
    {
      service: 'payment',
      timestamp: ctx.t(130),
      metric: 'error_rate',
      value: 0.2,
    },
    {
      service: 'payment',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 1.5,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 6.8,
    },
    {
      service: 'payment',
      timestamp: ctx.t(130),
      metric: 'latency_p95',
      value: 120,
    },
    {
      service: 'payment',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 2100,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(130),
      metric: 'error_rate',
      value: 0.25,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(120),
      metric: 'error_rate',
      value: 0.8,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'error_rate',
      value: 5.4,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(130),
      metric: 'latency_p95',
      value: 200,
    },
    {
      service: 'checkout',
      timestamp: ctx.t(100),
      metric: 'latency_p95',
      value: 890,
    },
  ]);

  await insertLogs(ctx, [
    {
      service: 'checkout',
      timestamp: ctx.t(105),
      level: 'ERROR',
      message: 'PaymentProviderError',
      metadata: { provider: 'acme-pay', code: 'upstream_timeout' },
    },
    {
      service: 'payment',
      timestamp: ctx.t(104),
      level: 'ERROR',
      message: 'UpstreamGatewayTimeout',
      metadata: { provider: 'acme-pay' },
    },
  ]);

  await insertDatabaseMetrics(ctx, [
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(120),
      cpu: 36,
      connections: 92,
      queryLatency: 30,
    },
    {
      database: PRODUCTION_DB,
      timestamp: ctx.t(100),
      cpu: 40,
      connections: 98,
      queryLatency: 33,
    },
  ]);

  await insertIncidents(ctx, [
    {
      service: 'checkout',
      title: 'Checkout errors correlated with payment provider',
      description:
        'Elevated checkout failures without a recent checkout deployment.',
      severity: 'high',
      status: 'investigating',
      startedAt: ctx.t(108),
    },
  ]);
}
