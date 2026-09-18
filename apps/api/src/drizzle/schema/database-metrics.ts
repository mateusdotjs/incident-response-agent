import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const databaseMetrics = pgTable(
  'database_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    database: text('database').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    cpu: doublePrecision('cpu').notNull(),
    connections: integer('connections').notNull(),
    queryLatency: doublePrecision('query_latency').notNull(),
  },
  (table) => [
    index('database_metrics_database_timestamp_idx').on(
      table.database,
      table.timestamp,
    ),
  ],
);
