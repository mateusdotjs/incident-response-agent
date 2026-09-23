import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { metrics, services } from '../drizzle/schema';
import { isUuid } from './service-ref';

@Injectable()
export class ServicesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findAll() {
    return this.db.select().from(services).orderBy(services.name);
  }

  async findById(serviceId: string) {
    const [service] = await this.db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    return service ?? null;
  }

  async findByName(name: string) {
    const [service] = await this.db
      .select()
      .from(services)
      .where(eq(services.name, name))
      .limit(1);

    return service ?? null;
  }

  findByRef(ref: string) {
    if (isUuid(ref)) {
      return this.findById(ref);
    }

    return this.findByName(ref);
  }

  async findLatestMetricValue(serviceId: string, metric: string) {
    const [row] = await this.db
      .select({ value: metrics.value })
      .from(metrics)
      .where(and(eq(metrics.serviceId, serviceId), eq(metrics.metric, metric)))
      .orderBy(desc(metrics.timestamp))
      .limit(1);

    return row?.value ?? null;
  }
}
