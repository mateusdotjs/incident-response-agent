import { drizzle } from 'drizzle-orm/node-postgres';

export function createDatabase(connectionString: string) {
  return drizzle({ connection: { connectionString } });
}

export type Database = ReturnType<typeof createDatabase>;
