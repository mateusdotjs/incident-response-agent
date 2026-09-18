import { Injectable } from '@nestjs/common';
import { FindLogsParams, LogsRepository } from './logs.repository';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { ListLogsResponseDto } from './dto/log-response.dto';

@Injectable()
export class LogsService {
  constructor(private readonly repository: LogsRepository) {}

  async find(query: ListLogsQueryDto): Promise<ListLogsResponseDto> {
    const params: FindLogsParams = {
      serviceId: query.serviceId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      level: query.level,
      query: query.query,
      limit: query.limit ?? 50,
    };

    const [rows, total] = await Promise.all([
      this.repository.find(params),
      this.repository.countAll(params),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        serviceId: row.serviceId,
        timestamp: row.timestamp,
        level: row.level,
        message: row.message,
        metadata: row.metadata,
      })),
      total,
    };
  }
}
