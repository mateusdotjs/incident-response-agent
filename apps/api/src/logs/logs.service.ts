import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../services/services.repository';
import { FindLogsParams, LogsRepository } from './logs.repository';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { ListLogsResponseDto } from './dto/log-response.dto';

@Injectable()
export class LogsService {
  constructor(
    private readonly repository: LogsRepository,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async find(query: ListLogsQueryDto): Promise<ListLogsResponseDto> {
    let serviceId: string | undefined;

    if (query.serviceId) {
      const service = await this.servicesRepository.findByRef(query.serviceId);

      if (!service) {
        throw new NotFoundException(`Service "${query.serviceId}" not found`);
      }

      serviceId = service.id;
    }

    const params: FindLogsParams = {
      serviceId,
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
