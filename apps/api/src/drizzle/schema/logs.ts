import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { services } from './services';

export const logLevel = pgEnum('log_level', ['INFO', 'WARN', 'ERROR']);

export const logs = pgTable(
  'logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    level: logLevel('level').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  },
  (table) => [
    index('logs_service_id_timestamp_idx').on(table.serviceId, table.timestamp),
  ],
);
