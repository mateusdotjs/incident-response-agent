import { Injectable } from '@nestjs/common';
import { IncidentsRepository } from './incidents.repository';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto';
import { ListIncidentsResponseDto } from './dto/incident-response.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly repository: IncidentsRepository) {}

  async find(query: ListIncidentsQueryDto): Promise<ListIncidentsResponseDto> {
    const rows = await this.repository.find({
      status: query.status,
      severity: query.severity,
      serviceId: query.serviceId,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        serviceId: row.serviceId,
        title: row.title,
        description: row.description,
        severity: row.severity,
        status: row.status,
        startedAt: row.startedAt,
        resolvedAt: row.resolvedAt,
      })),
    };
  }
}
