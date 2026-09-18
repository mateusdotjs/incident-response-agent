import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { services } from './services';

export const metrics = pgTable(
  'metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    metric: text('metric').notNull(),
    value: doublePrecision('value').notNull(),
  },
  (table) => [
    index('metrics_service_id_metric_timestamp_idx').on(
      table.serviceId,
      table.metric,
      table.timestamp,
    ),
  ],
);
