import {
  databaseMetrics,
  deployments,
  incidents,
  logs,
  metrics,
  services,
} from '../drizzle/schema';
import type { SeedContext, ServiceName } from './types';

type DeploymentInsert = {
  service: ServiceName;
  version: string;
  commitSha: string;
  environment?: string;
  status: 'success' | 'failed' | 'rolled_back';
  deployedAt: Date;
  changes?: string[];
};

type MetricInsert = {
  service: ServiceName;
  timestamp: Date;
  metric: string;
  value: number;
};

type LogInsert = {
  service: ServiceName;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  metadata?: Record<string, unknown>;
};

type DatabaseMetricInsert = {
  database: string;
  timestamp: Date;
  cpu: number;
  connections: number;
  queryLatency: number;
};

type IncidentInsert = {
  service?: ServiceName;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  startedAt: Date;
  resolvedAt?: Date | null;
};

function serviceId(ctx: SeedContext, name: ServiceName): string {
  const id = ctx.serviceIds.get(name);
  if (!id) {
    throw new Error(`Missing service id for "${name}"`);
  }
  return id;
}

export async function insertDeployments(
  ctx: SeedContext,
  rows: DeploymentInsert[],
) {
  if (rows.length === 0) {
    return;
  }

  await ctx.db.insert(deployments).values(
    rows.map((row) => ({
      serviceId: serviceId(ctx, row.service),
      version: row.version,
      commitSha: row.commitSha,
      environment: row.environment ?? 'production',
      status: row.status,
      deployedAt: row.deployedAt,
      changes: row.changes ?? [],
    })),
  );
}

export async function insertMetrics(ctx: SeedContext, rows: MetricInsert[]) {
  if (rows.length === 0) {
    return;
  }

  await ctx.db.insert(metrics).values(
    rows.map((row) => ({
      serviceId: serviceId(ctx, row.service),
      timestamp: row.timestamp,
      metric: row.metric,
      value: row.value,
    })),
  );
}

export async function insertLogs(ctx: SeedContext, rows: LogInsert[]) {
  if (rows.length === 0) {
    return;
  }

  await ctx.db.insert(logs).values(
    rows.map((row) => ({
      serviceId: serviceId(ctx, row.service),
      timestamp: row.timestamp,
      level: row.level,
      message: row.message,
      metadata: row.metadata,
    })),
  );
}

export async function insertDatabaseMetrics(
  ctx: SeedContext,
  rows: DatabaseMetricInsert[],
) {
  if (rows.length === 0) {
    return;
  }

  await ctx.db.insert(databaseMetrics).values(rows);
}

export async function insertIncidents(
  ctx: SeedContext,
  rows: IncidentInsert[],
) {
  if (rows.length === 0) {
    return;
  }

  await ctx.db.insert(incidents).values(
    rows.map((row) => ({
      serviceId: row.service ? serviceId(ctx, row.service) : null,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      startedAt: row.startedAt,
      resolvedAt: row.resolvedAt ?? null,
    })),
  );
}

export async function seedSharedServices(ctx: SeedContext) {
  const rows = await ctx.db
    .insert(services)
    .values([
      {
        name: 'checkout',
        description: 'Checkout service',
        team: 'payments',
        repository: 'company/checkout',
        environment: 'production',
      },
      {
        name: 'payment',
        description: 'Payment provider integration',
        team: 'payments',
        repository: 'company/payment',
        environment: 'production',
      },
      {
        name: 'orders',
        description: 'Order management',
        team: 'commerce',
        repository: 'company/orders',
        environment: 'production',
      },
      {
        name: 'catalog',
        description: 'Product catalog',
        team: 'commerce',
        repository: 'company/catalog',
        environment: 'production',
      },
    ])
    .returning({ id: services.id, name: services.name });

  for (const row of rows) {
    ctx.serviceIds.set(row.name as ServiceName, row.id);
  }
}
