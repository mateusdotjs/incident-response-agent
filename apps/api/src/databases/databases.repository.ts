import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { databaseMetrics } from '../drizzle/schema';

@Injectable()
export class DatabasesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findPoints(params: { database: string; from?: Date; to?: Date }) {
    const filters: SQL[] = [eq(databaseMetrics.database, params.database)];

    if (params.from) {
      filters.push(gte(databaseMetrics.timestamp, params.from));
    }

    if (params.to) {
      filters.push(lte(databaseMetrics.timestamp, params.to));
    }

    return this.db
      .select({
        timestamp: databaseMetrics.timestamp,
        cpu: databaseMetrics.cpu,
        connections: databaseMetrics.connections,
        queryLatency: databaseMetrics.queryLatency,
      })
      .from(databaseMetrics)
      .where(and(...filters))
      .orderBy(asc(databaseMetrics.timestamp));
  }
}
