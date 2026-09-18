import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { services } from './services';

export const deploymentStatus = pgEnum('deployment_status', [
  'success',
  'failed',
  'rolled_back',
]);

export const deployments = pgTable(
  'deployments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),
    version: text('version').notNull(),
    commitSha: text('commit_sha').notNull(),
    environment: text('environment').notNull().default('production'),
    status: deploymentStatus('status').notNull(),
    deployedAt: timestamp('deployed_at', { withTimezone: true }).notNull(),
    changes: text('changes').array().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('deployments_service_id_deployed_at_idx').on(
      table.serviceId,
      table.deployedAt,
    ),
  ],
);
