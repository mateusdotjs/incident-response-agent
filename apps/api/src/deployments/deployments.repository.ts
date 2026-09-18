import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { DATABASE } from '../drizzle/drizzle.module';
import type { Database } from '../drizzle/drizzle-client';
import { deployments } from '../drizzle/schema';

@Injectable()
export class DeploymentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  findByService(params: {
    serviceId: string;
    from?: Date;
    to?: Date;
    environment?: string;
    status?: 'success' | 'failed' | 'rolled_back';
  }) {
    const filters: SQL[] = [eq(deployments.serviceId, params.serviceId)];

    if (params.from) {
      filters.push(gte(deployments.deployedAt, params.from));
    }

    if (params.to) {
      filters.push(lte(deployments.deployedAt, params.to));
    }

    if (params.environment) {
      filters.push(eq(deployments.environment, params.environment));
    }

    if (params.status) {
      filters.push(eq(deployments.status, params.status));
    }

    return this.db
      .select()
      .from(deployments)
      .where(and(...filters))
      .orderBy(desc(deployments.deployedAt));
  }

  async findById(deploymentId: string) {
    const [deployment] = await this.db
      .select()
      .from(deployments)
      .where(eq(deployments.id, deploymentId))
      .limit(1);

    return deployment ?? null;
  }
}
