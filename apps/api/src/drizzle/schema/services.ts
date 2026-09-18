import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  team: text('team'),
  repository: text('repository'),
  environment: text('environment').notNull().default('production'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
