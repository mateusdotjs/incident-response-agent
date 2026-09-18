import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { services } from './services';

export const incidentSeverity = pgEnum('incident_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const incidentStatus = pgEnum('incident_status', [
  'open',
  'investigating',
  'resolved',
]);

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').references(() => services.id),
  title: text('title').notNull(),
  description: text('description'),
  severity: incidentSeverity('severity').notNull(),
  status: incidentStatus('status').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
