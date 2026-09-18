import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { metrics } from '../drizzle/schema';

@Injectable()
export class MetricsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findPoints(params: {
    serviceId: string;
    metric: string;
    from?: Date;
    to?: Date;
  }) {
    const filters: SQL[] = [
      eq(metrics.serviceId, params.serviceId),
      eq(metrics.metric, params.metric),
    ];

    if (params.from) {
      filters.push(gte(metrics.timestamp, params.from));
    }

    if (params.to) {
      filters.push(lte(metrics.timestamp, params.to));
    }

    return this.db
      .select({ timestamp: metrics.timestamp, value: metrics.value })
      .from(metrics)
      .where(and(...filters))
      .orderBy(asc(metrics.timestamp));
  }
}
