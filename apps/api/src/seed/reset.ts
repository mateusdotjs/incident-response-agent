import { sql } from 'drizzle-orm';
import type { Database } from '../drizzle/drizzle-client';

export async function resetDatabase(db: Database) {
  await db.execute(sql`
    TRUNCATE incidents, logs, metrics, deployments, database_metrics, services
    RESTART IDENTITY CASCADE
  `);
}
