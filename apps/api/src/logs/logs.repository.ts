import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, lte, type SQL } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { logs } from '../drizzle/schema';

export type FindLogsParams = {
  serviceId?: string;
  from?: Date;
  to?: Date;
  level?: 'INFO' | 'WARN' | 'ERROR';
  query?: string;
  limit: number;
};

@Injectable()
export class LogsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  find(params: FindLogsParams) {
    return this.db
      .select()
      .from(logs)
      .where(and(...this.buildFilters(params)))
      .orderBy(desc(logs.timestamp))
      .limit(params.limit);
  }

  async countAll(params: FindLogsParams) {
    const [row] = await this.db
      .select({ total: count() })
      .from(logs)
      .where(and(...this.buildFilters(params)));

    return row?.total ?? 0;
  }

  private buildFilters(params: FindLogsParams): SQL[] {
    const filters: SQL[] = [];

    if (params.serviceId) {
      filters.push(eq(logs.serviceId, params.serviceId));
    }

    if (params.from) {
      filters.push(gte(logs.timestamp, params.from));
    }

    if (params.to) {
      filters.push(lte(logs.timestamp, params.to));
    }

    if (params.level) {
      filters.push(eq(logs.level, params.level));
    }

    if (params.query) {
      filters.push(ilike(logs.message, `%${params.query}%`));
    }

    return filters;
  }
}
