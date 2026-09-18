import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { incidents } from '../drizzle/schema';

@Injectable()
export class IncidentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  find(params: {
    status?: 'open' | 'investigating' | 'resolved';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    serviceId?: string;
  }) {
    const filters: SQL[] = [];

    if (params.status) {
      filters.push(eq(incidents.status, params.status));
    }

    if (params.severity) {
      filters.push(eq(incidents.severity, params.severity));
    }

    if (params.serviceId) {
      filters.push(eq(incidents.serviceId, params.serviceId));
    }

    return this.db
      .select()
      .from(incidents)
      .where(and(...filters))
      .orderBy(desc(incidents.startedAt));
  }
}
