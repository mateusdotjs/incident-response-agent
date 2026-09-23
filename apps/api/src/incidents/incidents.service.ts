import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../services/services.repository';
import { IncidentsRepository } from './incidents.repository';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto';
import { ListIncidentsResponseDto } from './dto/incident-response.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly repository: IncidentsRepository,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async find(query: ListIncidentsQueryDto): Promise<ListIncidentsResponseDto> {
    let serviceId: string | undefined;

    if (query.serviceId) {
      const service = await this.servicesRepository.findByRef(query.serviceId);

      if (!service) {
        throw new NotFoundException(`Service "${query.serviceId}" not found`);
      }

      serviceId = service.id;
    }

    const rows = await this.repository.find({
      status: query.status,
      severity: query.severity,
      serviceId,
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
