import { Injectable } from '@nestjs/common';
import { DatabasesRepository } from './databases.repository';
import { ListDatabaseMetricsQueryDto } from './dto/list-database-metrics-query.dto';
import { DatabaseMetricsResponseDto } from './dto/database-metrics-response.dto';

@Injectable()
export class DatabasesService {
  constructor(private readonly repository: DatabasesRepository) {}

  async findMetrics(
    database: string,
    query: ListDatabaseMetricsQueryDto,
  ): Promise<DatabaseMetricsResponseDto> {
    const points = await this.repository.findPoints({
      database,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return {
      database,
      points: points.map((point) => ({
        timestamp: point.timestamp,
        cpu: point.cpu,
        connections: point.connections,
        queryLatency: point.queryLatency,
      })),
    };
  }
}
